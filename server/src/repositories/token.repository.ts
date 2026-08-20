import { prisma } from '../config/prisma';

export const tokenRepository = {
  createRefreshToken: (userId: string, expiresAt: Date) =>
    prisma.refreshToken.create({ data: { userId, expiresAt } }),

  findRefreshTokenById: (id: string) => prisma.refreshToken.findUnique({ where: { id } }),

  revokeRefreshToken: (id: string) =>
    prisma.refreshToken.update({ where: { id }, data: { revoked: true } }),

  revokeAllForUser: (userId: string) =>
    prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    }),

  createPasswordResetToken: (userId: string, tokenHash: string, expiresAt: Date) =>
    prisma.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } }),

  findPasswordResetToken: (tokenHash: string) =>
    prisma.passwordResetToken.findUnique({ where: { tokenHash } }),

  markPasswordResetTokenUsed: (id: string) =>
    prisma.passwordResetToken.update({ where: { id }, data: { used: true } }),
};
