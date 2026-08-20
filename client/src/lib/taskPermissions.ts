import type { Task } from '@/types/task';
import type { User } from '@/types/api';

export type EditableTaskField =
  | 'title'
  | 'description'
  | 'priority'
  | 'status'
  | 'dueDate'
  | 'category'
  | 'tags'
  | 'assignedUserId';

// Mirrors ASSIGNEE_ALLOWED_FIELDS in server/src/services/task.service.ts —
// keep these in sync if that rule ever changes.
const ASSIGNEE_ONLY_FIELDS = new Set<EditableTaskField>(['priority', 'status']);

export interface TaskPermissions {
  canEditAll: boolean;
  canEditStatusOnly: boolean;
  canDelete: boolean;
  isFieldEditable: (field: EditableTaskField) => boolean;
}

export function getTaskPermissions(task: Task, user: User | null): TaskPermissions {
  const isOwner = user !== null && task.ownerId === user.id;
  const isAdmin = user?.role === 'ADMIN';
  const isAssignee = user !== null && task.assignedUserId === user.id;

  const canEditAll = isOwner || isAdmin;
  const canEditStatusOnly = !canEditAll && isAssignee;

  return {
    canEditAll,
    canEditStatusOnly,
    canDelete: canEditAll,
    isFieldEditable: (field) => canEditAll || (canEditStatusOnly && ASSIGNEE_ONLY_FIELDS.has(field)),
  };
}
