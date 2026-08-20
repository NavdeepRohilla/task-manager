import { body, query } from 'express-validator';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

export const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional({ values: 'null' }).isString().isLength({ max: 5000 }),
  body('priority').optional().isIn(PRIORITIES).withMessage(`priority must be one of: ${PRIORITIES.join(', ')}`),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('dueDate').optional({ values: 'null' }).isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
  body('category').optional({ values: 'null' }).isString().trim().isLength({ max: 100 }),
  body('tags').optional().isArray({ max: 20 }).withMessage('tags must be an array of up to 20 strings'),
  body('tags.*').isString().trim().isLength({ max: 50 }),
  body('assignedUserId').optional({ values: 'null' }).isString().trim(),
];

export const updateTaskValidator = [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional({ values: 'null' }).isString().isLength({ max: 5000 }),
  body('priority').optional().isIn(PRIORITIES).withMessage(`priority must be one of: ${PRIORITIES.join(', ')}`),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`),
  body('dueDate').optional({ values: 'null' }).isISO8601().withMessage('dueDate must be a valid ISO 8601 date'),
  body('category').optional({ values: 'null' }).isString().trim().isLength({ max: 100 }),
  body('tags').optional().isArray({ max: 20 }).withMessage('tags must be an array of up to 20 strings'),
  body('tags.*').isString().trim().isLength({ max: 50 }),
  body('assignedUserId').optional({ values: 'null' }).isString().trim(),
  body('isArchived').optional().isBoolean().withMessage('isArchived must be a boolean').toBoolean(),
];

export const listTasksValidator = [
  query('search').optional().isString().trim().isLength({ min: 1, max: 200 }),
  query('status').optional().isIn(STATUSES),
  query('priority').optional().isIn(PRIORITIES),
  query('category').optional().isString().trim().isLength({ min: 1, max: 100 }),
  query('tag').optional().isString().trim().isLength({ min: 1, max: 50 }),
  query('isArchived').optional().isBoolean().toBoolean(),
  query('assignedUserId').optional().isString().trim(),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'title']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100').toInt(),
];
