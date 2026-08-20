import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { getParam } from '../utils/params';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { adminService } from '../services/admin.service';

const requireUser = (req: Request) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  return req.user;
};

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const result = await adminService.listUsers(page, limit);
  ApiResponse.success(res, 200, 'Users fetched', result);
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  const user = await adminService.updateUserRole(getParam(req, 'id'), req.body.role as Role, currentUser.id);
  ApiResponse.success(res, 200, 'User role updated', user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  await adminService.deleteUser(getParam(req, 'id'), currentUser.id);
  ApiResponse.success(res, 200, 'User deleted');
});

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  ApiResponse.success(res, 200, 'Dashboard stats fetched', stats);
});
