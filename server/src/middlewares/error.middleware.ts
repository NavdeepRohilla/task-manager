import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { isProduction } from '../config/env';

/**
 * Last middleware in the chain (4-arg signature is what tells Express this
 * is an error handler, not a normal middleware). Every thrown/next(err)
 * error in the app ends up here exactly once, so this is the only place
 * that needs to know how to turn an error into an HTTP response.
 */
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error && !isProduction) {
    message = err.message;
  }

  if (statusCode >= 500) {
    console.error('[UNHANDLED ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined ? { details } : {}),
    ...(!isProduction && err instanceof Error ? { stack: err.stack } : {}),
  });
};
