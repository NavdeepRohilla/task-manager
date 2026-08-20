import type { PublicUserRef } from './api';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  category: string | null;
  tags: string[];
  isArchived: boolean;
  ownerId: string;
  owner: PublicUserRef;
  assignedUserId: string | null;
  assignedUser: PublicUserRef | null;
  createdAt: string;
  updatedAt: string;
  _count: { comments: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskListResult {
  tasks: Task[];
  pagination: PaginationMeta;
}

export interface Comment {
  id: string;
  message: string;
  userId: string;
  taskId: string;
  createdAt: string;
  user: PublicUserRef;
}

export interface TaskStats {
  totalTasks: number;
  completed: number;
  pending: number;
  highPriority: number;
  overdue: number;
  byStatus: Record<string, number>;
  byCategory: { category: string; count: number }[];
  weeklyProgress: { date: string; count: number }[];
}

export interface ListTasksParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  tag?: string;
  isArchived?: boolean;
  assignedUserId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TaskFormInput {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  category?: string | null;
  tags?: string[];
  assignedUserId?: string | null;
  isArchived?: boolean;
}
