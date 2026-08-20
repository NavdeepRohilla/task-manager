import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { userRepository } from '../repositories/user.repository';
import { userService } from '../services/user.service';

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }

  const user = await userRepository.findById(req.user.id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, 200, 'Current user fetched', {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

// Any authenticated user — this intentionally is NOT admin-only. It exists
// so the task-assignment picker can look up teammates; it returns the same
// safe (no password) shape admins see, just without pagination since it's a
// capped typeahead search, not a management table.
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const users = await userService.searchUsers(search);
  ApiResponse.success(res, 200, 'Users fetched', users);
});
