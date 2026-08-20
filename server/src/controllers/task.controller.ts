import { Request, Response } from 'express';
import { Priority, TaskStatus } from '@prisma/client';
import { getParam } from '../utils/params';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { taskService, ListTasksQuery, CreateTaskInput, UpdateTaskInput } from '../services/task.service';

// express-validator's sanitizers (.toInt()/.toBoolean()) mutate req.query in
// place at runtime, but its static type stays a qs-parsed string union —
// this is the one place that reconciles the two.
const parseListQuery = (query: Request['query']): ListTasksQuery => {
  const str = (key: string): string | undefined => {
    const value = query[key];
    return typeof value === 'string' ? value : undefined;
  };

  const isArchivedRaw: unknown = query.isArchived;

  return {
    search: str('search'),
    status: str('status') as TaskStatus | undefined,
    priority: str('priority') as Priority | undefined,
    category: str('category'),
    tag: str('tag'),
    isArchived: isArchivedRaw === true || isArchivedRaw === 'true',
    assignedUserId: str('assignedUserId'),
    sortBy: str('sortBy') as ListTasksQuery['sortBy'],
    sortOrder: str('sortOrder') as ListTasksQuery['sortOrder'],
    page: query.page !== undefined ? Number(query.page) : undefined,
    limit: query.limit !== undefined ? Number(query.limit) : undefined,
  };
};

const requireUser = (req: Request) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  return req.user;
};

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  const input: CreateTaskInput = req.body;
  const task = await taskService.createTask(currentUser, input);
  ApiResponse.success(res, 201, 'Task created', task);
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  const query = parseListQuery(req.query);
  const result = await taskService.listTasks(currentUser, query);
  ApiResponse.success(res, 200, 'Tasks fetched', result);
});

export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  const task = await taskService.getTaskById(getParam(req, 'id'), currentUser);
  ApiResponse.success(res, 200, 'Task fetched', task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  const updates: UpdateTaskInput = req.body;
  const task = await taskService.updateTask(getParam(req, 'id'), currentUser, updates);
  ApiResponse.success(res, 200, 'Task updated', task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  await taskService.deleteTask(getParam(req, 'id'), currentUser);
  ApiResponse.success(res, 200, 'Task deleted');
});

export const getMyStats = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  const stats = await taskService.getMyStats(currentUser);
  ApiResponse.success(res, 200, 'Stats fetched', stats);
});
