import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/admin.service';
import type { Role } from '@/types/api';

export const adminKeys = {
  dashboard: ['admin', 'dashboard'] as const,
  users: (page: number, limit: number) => ['admin', 'users', page, limit] as const,
};

export function useAdminDashboardQuery(enabled = true) {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: () => adminApi.dashboard(),
    enabled,
  });
}

export function useAdminUsersQuery(page: number, limit = 20) {
  return useQuery({
    queryKey: adminKeys.users(page, limit),
    queryFn: () => adminApi.listUsers(page, limit),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
