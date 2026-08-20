import { body, query } from 'express-validator';

export const updateUserRoleValidator = [
  body('role')
    .notEmpty()
    .withMessage('role is required')
    .isIn(['ADMIN', 'USER'])
    .withMessage('role must be either ADMIN or USER'),
];

export const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
