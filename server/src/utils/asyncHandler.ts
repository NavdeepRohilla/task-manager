import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Express 5 does catch rejected promises from async handlers on its own now,
 * but wrapping explicitly here keeps the error-forwarding behavior visible
 * in the code itself rather than depending on a specific Express version's
 * implicit behavior, and keeps controllers free of repetitive try/catch.
 */
export const asyncHandler = (fn: AsyncRouteHandler): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
