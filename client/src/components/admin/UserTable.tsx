import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { useAdminUsersQuery, useUpdateUserRole, useDeleteUser } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/errors';
import type { Role } from '@/types/api';
import { FlapChip } from '@/components/ui/flap-chip';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Pagination } from '@/components/tasks/Pagination';

interface UserTableProps {
  page: number;
  onPageChange: (page: number) => void;
}

export function UserTable({ page, onPageChange }: UserTableProps) {
  const currentUser = useAuthStore((s) => s.user);
  const { data, isLoading, isError, error } = useAdminUsersQuery(page);
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const handleRoleChange = (userId: string, role: Role) => {
    updateRole.mutate(
      { userId, role },
      {
        onSuccess: () => toast.success('Role updated'),
        onError: (err) => toast.error(getErrorMessage(err, 'Could not update role')),
      }
    );
  };

  const handleDelete = (userId: string, name: string) => {
    if (!window.confirm(`Delete ${name}'s account? This can't be undone.`)) return;
    deleteUser.mutate(userId, {
      onSuccess: () => toast.success('User deleted'),
      onError: (err) => toast.error(getErrorMessage(err, 'Could not delete user')),
    });
  };

  if (isLoading) return <p className="py-8 text-center text-sm text-muted">Loading users…</p>;
  if (isError) return <p className="py-8 text-center text-sm text-danger">{getErrorMessage(error, 'Could not load users')}</p>;
  if (!data) return null;

  return (
    <div className="rounded-sm border border-line bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            return (
              <tr key={user.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink">
                  {user.name} {isSelf && <FlapChip tone="muted" className="ml-1">YOU</FlapChip>}
                </td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  {isSelf ? (
                    <FlapChip tone="signal">{user.role}</FlapChip>
                  ) : (
                    <Select value={user.role} onValueChange={(role) => handleRoleChange(user.id, role as Role)}>
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id, user.name)}
                      className="text-muted hover:text-danger"
                      aria-label={`Delete ${user.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 pb-2">
        <Pagination meta={data.pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
