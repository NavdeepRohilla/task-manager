const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parses simple duration strings like "15m", "7d", "1h" into milliseconds.
 * Deliberately minimal (single number + unit) — it covers every value used
 * in this project's .env files, and a single regex is easier to trust than
 * pulling in a whole date-math dependency for this.
 */
export const parseDurationToMs = (duration: string): number => {
  const match = /^(\d+)\s*([smhd])$/i.exec(duration.trim());

  if (!match) {
    throw new Error(
      `Invalid duration "${duration}". Expected a number followed by s, m, h, or d (e.g. "15m", "7d").`
    );
  }

  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit.toLowerCase()];
};
