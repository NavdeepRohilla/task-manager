import { body } from 'express-validator';

export const addCommentValidator = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Comment message is required')
    .isLength({ max: 2000 })
    .withMessage('Comment must be 2000 characters or fewer'),
];
