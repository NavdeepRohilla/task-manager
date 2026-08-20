import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { userRepository } from '../repositories/user.repository';
import { tokenRepository } from '../repositories/token.repository';
import { mailService } from './mail.service';
import { generateRawToken, hashToken } from '../utils/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { parseDurationToMs } from '../utils/duration';

const buildAuthTokens = async (userId: string, role: Role) => {
  const accessToken = signAccessToken({ sub: userId, role });

  const refreshExpiresAt = new Date(Date.now() + parseDurationToMs(env.jwtRefreshExpiresIn));
  const refreshRecord = await tokenRepository.createRefreshToken(userId, refreshExpiresAt);
  const refreshToken = signRefreshToken({ sub: userId, jti: refreshRecord.id });

  return { accessToken, refreshToken };
};

export const authService = {
  register: async (name: string, email: string, password: string) => {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, env.bcryptSaltRounds);
    // Role is never accepted from the request body — public registration
    // always creates a USER. Promoting to ADMIN is a deliberate separate
    // action (seed script, or an admin-only endpoint in a later phase).
    const user = await userRepository.create({ name, email, password: hashedPassword });
    const tokens = await buildAuthTokens(user.id, user.role);

    return { user, ...tokens };
  },

  login: async (email: string, password: string) => {
    const user = await userRepository.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = await buildAuthTokens(user.id, user.role);
    return { user, ...tokens };
  },

  refresh: async (refreshToken: string | undefined) => {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token missing');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const stored = await tokenRepository.findRefreshTokenById(payload.jti);

    if (!stored || stored.revoked || stored.userId !== payload.sub || stored.expiresAt <= new Date()) {
      throw ApiError.unauthorized('Refresh token is no longer valid');
    }

    // Rotation: retire the token that was just used and issue a brand new
    // pair. If a stolen refresh token is ever replayed after the legitimate
    // client already rotated it, this row will already be revoked and the
    // replay is rejected above.
    await tokenRepository.revokeRefreshToken(stored.id);

    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    return buildAuthTokens(user.id, user.role);
  },

  logout: async (refreshToken: string | undefined) => {
    if (!refreshToken) return;

    try {
      const payload = verifyRefreshToken(refreshToken);
      await tokenRepository.revokeRefreshToken(payload.jti);
    } catch {
      // Already invalid or expired — nothing left to revoke, logout still "succeeds".
    }
  },

  forgotPassword: async (email: string) => {
    const user = await userRepository.findByEmail(email);
    // Same response whether or not the account exists, so this endpoint
    // can't be used to discover which emails are registered.
    if (!user) return;

    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.passwordResetTokenExpiresMin * 60 * 1000);

    await tokenRepository.createPasswordResetToken(user.id, tokenHash, expiresAt);

    const resetUrl = `${env.clientUrl}/reset-password?token=${rawToken}`;
    await mailService.sendPasswordResetEmail(user.email, resetUrl);
  },

  resetPassword: async (rawToken: string, newPassword: string) => {
    const tokenHash = hashToken(rawToken);
    const stored = await tokenRepository.findPasswordResetToken(tokenHash);

    if (!stored || stored.used || stored.expiresAt < new Date()) {
      throw ApiError.badRequest('Reset token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
    await userRepository.updatePassword(stored.userId, hashedPassword);
    await tokenRepository.markPasswordResetTokenUsed(stored.id);
    // Resetting a password invalidates every existing session, not just the
    // one that requested the reset — if an attacker had a live session, this closes it too.
    await tokenRepository.revokeAllForUser(stored.userId);
  },
};
