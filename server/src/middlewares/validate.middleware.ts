import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

/** Runs after a route's express-validator chains; turns failures into one 400. */
export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const formatted = errors.array().map((err) => ({
    field: err.type === 'field' ? err.path : undefined,
    message: err.msg,
  }));

  next(ApiError.badRequest('Validation failed', formatted));
};
