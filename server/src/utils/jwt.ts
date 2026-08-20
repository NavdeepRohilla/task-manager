import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';
import { parseDurationToMs } from './duration';

export interface AccessTokenPayload {
  sub: string; // userId
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string; // userId
  jti: string; // matches a RefreshToken.id row, so it can be revoked/rotated
}

// jsonwebtoken's `expiresIn` option type is stricter about string patterns
// than a plain env-var string satisfies, but it always accepts a plain
// number of seconds — so converting our "15m" / "7d" style env values to
// seconds here sidesteps that friction entirely and reuses parseDurationToMs.
const toSeconds = (duration: string): number => Math.floor(parseDurationToMs(duration) / 1000);

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.jwtAccessSecret, { expiresIn: toSeconds(env.jwtAccessExpiresIn) });

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;

export const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: toSeconds(env.jwtRefreshExpiresIn) });

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
