import crypto from 'crypto';

/** Raw, high-entropy token — this is the value that goes into the emailed reset link. */
export const generateRawToken = (): string => crypto.randomBytes(32).toString('hex');

/** One-way hash of a raw token — this is the value that gets stored in the database. */
export const hashToken = (rawToken: string): string =>
  crypto.createHash('sha256').update(rawToken).digest('hex');
