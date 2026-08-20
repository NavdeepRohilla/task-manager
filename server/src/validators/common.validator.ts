import { param } from 'express-validator';

/** Validates a route param is present — e.g. `idParamValidator('id')` for `/tasks/:id`. */
export const idParamValidator = (paramName = 'id') => [
  param(paramName).trim().notEmpty().withMessage(`${paramName} is required`),
];
