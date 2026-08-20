import 'dotenv/config';

interface EnvConfig {
  nodeEnv: string;
  port: number;
  databaseUrl: string;
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  bcryptSaltRounds: number;
  clientUrl: string;
  passwordResetTokenExpiresMin: number;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}. Check server/.env against server/.env.example.`
    );
  }
  return value;
}

// Reading these eagerly at import time means a misconfigured server fails
// immediately on boot with a clear message, instead of failing later and
// confusingly on the first request that happens to need the missing value.
export const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: required('DATABASE_URL'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  passwordResetTokenExpiresMin: Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MIN ?? 30),
};

export const isProduction = env.nodeEnv === 'production';
