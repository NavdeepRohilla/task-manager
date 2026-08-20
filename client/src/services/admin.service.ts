import { api } from './api';
import type { ApiSuccessResponse, PublicUserRecord, Role } from '@/types/api';
import type { PaginationMeta, TaskStats } from '@/types/task';

export interface AdminUserListResult {
  users: PublicUserRecord[];
  pagination: PaginationMeta;
}

export const adminApi = {
  listUsers: (page: number, limit: number) =>
    api.get<ApiSuccessResponse<AdminUserListResult>>('/admin/users', { params: { page, limit } }).then((res) => res.data.data),

  updateUserRole: (userId: string, role: Role) =>
    api.patch<ApiSuccessResponse<PublicUserRecord>>(`/admin/users/${userId}/role`, { role }).then((res) => res.data.data),

  deleteUser: (userId: string) =>
    api.delete<ApiSuccessResponse<null>>(`/admin/users/${userId}`).then((res) => res.data),

  dashboard: () => api.get<ApiSuccessResponse<TaskStats>>('/admin/dashboard').then((res) => res.data.data),
};
