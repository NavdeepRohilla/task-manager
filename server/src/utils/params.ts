import { Request } from 'express';

/**
 * Express 5's ParamsDictionary types every param as `string | string[]`, to
 * account for repeated-segment routes (e.g. `/files/*path`). None of our
 * routes use that pattern — every `:id` is always a single segment — so
 * this just narrows it back down to the `string` our code actually expects.
 */
export const getParam = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};
