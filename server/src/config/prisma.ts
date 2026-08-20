import { PrismaClient } from '@prisma/client';
import { isProduction } from './env';

// tsx/ts-node-watch reload src/ on every save. Without stashing the client on
// `global`, each reload would create a brand new PrismaClient (and a brand
// new connection pool) while the old one leaks. Reusing the same instance in
// development avoids exhausting Postgres connections during a long dev session.
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['query', 'warn', 'error'],
  });

if (!isProduction) {
  global.prismaGlobal = prisma;
}
