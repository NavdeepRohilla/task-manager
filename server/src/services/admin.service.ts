import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { userRepository, PublicUserRecord } from '../repositories/user.repository';
import { userService, PaginationMeta } from './user.service';
import { taskService, TaskStats } from './task.service';

export const adminService = {
  listUsers: (page: number, limit: number): Promise<{ users: PublicUserRecord[]; pagination: PaginationMeta }> =>
    userService.listUsers(page, limit),

  updateUserRole: async (targetUserId: string, newRole: Role, currentAdminId: string): Promise<PublicUserRecord> => {
    if (targetUserId === currentAdminId) {
      throw ApiError.badRequest('You cannot change your own role');
    }
    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return userRepository.updateRole(targetUserId, newRole);
  },

  deleteUser: async (targetUserId: string, currentAdminId: string): Promise<void> => {
    if (targetUserId === currentAdminId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }
    const user = await userRepository.findById(targetUserId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    await userRepository.deleteById(targetUserId);
  },

  getDashboardStats: (): Promise<TaskStats> => taskService.getGlobalStats(),
};
