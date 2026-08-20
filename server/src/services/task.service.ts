import { Prisma, Role, Priority, TaskStatus, TaskWithRelations } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { taskRepository, TaskStatsRow } from '../repositories/task.repository';
import { CurrentUser } from '../types/express';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string | null;
  category?: string | null;
  tags?: string[];
  assignedUserId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: string | null;
  category?: string | null;
  tags?: string[];
  assignedUserId?: string | null;
  isArchived?: boolean;
}

export interface ListTasksQuery {
  search?: string;
  status?: TaskStatus;
  priority?: Priority;
  category?: string;
  tag?: string;
  isArchived?: boolean;
  assignedUserId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
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

// Collaborators who are only assigned (not the owner, not an admin) can move
// a task along and reprioritize it, but can't rewrite, reassign, delete, or
// archive it — those stay with the owner/admin.
const ASSIGNEE_ALLOWED_FIELDS: ReadonlySet<keyof UpdateTaskInput> = new Set(['status', 'priority']);

const canView = (task: TaskWithRelations, currentUser: CurrentUser): boolean =>
  currentUser.role === Role.ADMIN || task.ownerId === currentUser.id || task.assignedUserId === currentUser.id;

const isOwnerOrAdmin = (task: TaskWithRelations, currentUser: CurrentUser): boolean =>
  currentUser.role === Role.ADMIN || task.ownerId === currentUser.id;

const buildWhereClause = (currentUser: CurrentUser, query: ListTasksQuery): Prisma.TaskWhereInput => {
  const conditions: Prisma.TaskWhereInput[] = [];

  if (currentUser.role !== Role.ADMIN) {
    // Non-admins only ever see tasks they own or are assigned to — this is
    // the one filter that can't be overridden by any query param.
    conditions.push({ OR: [{ ownerId: currentUser.id }, { assignedUserId: currentUser.id }] });
  } else if (query.assignedUserId) {
    conditions.push({ assignedUserId: query.assignedUserId });
  }

  // Archived tasks are hidden unless explicitly asked for.
  conditions.push({ isArchived: query.isArchived === true });

  if (query.status) conditions.push({ status: query.status });
  if (query.priority) conditions.push({ priority: query.priority });
  if (query.category) conditions.push({ category: query.category });
  if (query.tag) conditions.push({ tags: { has: query.tag } });
  if (query.search) {
    conditions.push({
      OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ],
    });
  }

  return { AND: conditions };
};

const computeStats = async (scopeWhere: Prisma.TaskWhereInput): Promise<TaskStats> => {
  const rows: TaskStatsRow[] = await taskRepository.findManyForStats(scopeWhere);
  const now = new Date();

  const byStatus: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0 };
  const byCategoryMap = new Map<string, number>();
  let highPriority = 0;
  let overdue = 0;

  for (const row of rows) {
    byStatus[row.status] = (byStatus[row.status] ?? 0) + 1;

    const categoryKey = row.category ?? 'Uncategorized';
    byCategoryMap.set(categoryKey, (byCategoryMap.get(categoryKey) ?? 0) + 1);

    if (row.priority === Priority.HIGH && row.status !== TaskStatus.COMPLETED) highPriority++;
    if (row.dueDate && row.dueDate < now && row.status !== TaskStatus.COMPLETED) overdue++;
  }

  // Last 7 calendar days, bucketed by completion date.
  const days = 7;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const weeklyBuckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    weeklyBuckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of rows) {
    if (!row.completedAt || row.completedAt < since) continue;
    const key = row.completedAt.toISOString().slice(0, 10);
    if (weeklyBuckets.has(key)) weeklyBuckets.set(key, (weeklyBuckets.get(key) ?? 0) + 1);
  }

  return {
    totalTasks: rows.length,
    completed: byStatus.COMPLETED ?? 0,
    pending: (byStatus.TODO ?? 0) + (byStatus.IN_PROGRESS ?? 0),
    highPriority,
    overdue,
    byStatus,
    byCategory: [...byCategoryMap.entries()].map(([category, count]) => ({ category, count })),
    weeklyProgress: [...weeklyBuckets.entries()].map(([date, count]) => ({ date, count })),
  };
};

export const taskService = {
  createTask: async (currentUser: CurrentUser, input: CreateTaskInput): Promise<TaskWithRelations> => {
    const status = input.status ?? TaskStatus.TODO;

    const data: Prisma.TaskUncheckedCreateInput = {
      title: input.title,
      description: input.description ?? null,
      priority: input.priority ?? Priority.MEDIUM,
      status,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      category: input.category ?? null,
      tags: input.tags ?? [],
      assignedUserId: input.assignedUserId ?? null,
      ownerId: currentUser.id,
      completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
    };

    return taskRepository.create(data);
  },

  listTasks: async (currentUser: CurrentUser, query: ListTasksQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where = buildWhereClause(currentUser, query);
    const orderBy = { [sortBy]: sortOrder };

    const [tasks, total] = await Promise.all([
      taskRepository.findMany(where, orderBy, (page - 1) * limit, limit),
      taskRepository.count(where),
    ]);

    return {
      tasks,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  },

  getTaskById: async (taskId: string, currentUser: CurrentUser): Promise<TaskWithRelations> => {
    const task = await taskRepository.findById(taskId);
    // 404, not 403, for tasks this user shouldn't even know exist —
    // otherwise the status code itself would leak that a task exists.
    if (!task || !canView(task, currentUser)) {
      throw ApiError.notFound('Task not found');
    }
    return task;
  },

  updateTask: async (
    taskId: string,
    currentUser: CurrentUser,
    updates: UpdateTaskInput
  ): Promise<TaskWithRelations> => {
    const task = await taskRepository.findById(taskId);
    if (!task || !canView(task, currentUser)) {
      throw ApiError.notFound('Task not found');
    }

    if (!isOwnerOrAdmin(task, currentUser)) {
      const attemptedFields = Object.keys(updates) as (keyof UpdateTaskInput)[];
      const disallowed = attemptedFields.filter((field) => !ASSIGNEE_ALLOWED_FIELDS.has(field));
      if (disallowed.length > 0) {
        throw ApiError.forbidden(
          `As an assignee (not the owner), you can only update: ${[...ASSIGNEE_ALLOWED_FIELDS].join(', ')}`
        );
      }
    }

    const data: Prisma.TaskUncheckedUpdateInput = { ...updates };
    if (updates.dueDate !== undefined) {
      data.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }
    if (updates.status !== undefined && updates.status !== task.status) {
      data.completedAt = updates.status === TaskStatus.COMPLETED ? new Date() : null;
    }

    return taskRepository.update(taskId, data);
  },

  deleteTask: async (taskId: string, currentUser: CurrentUser): Promise<void> => {
    const task = await taskRepository.findById(taskId);
    if (!task || !canView(task, currentUser)) {
      throw ApiError.notFound('Task not found');
    }
    if (!isOwnerOrAdmin(task, currentUser)) {
      throw ApiError.forbidden('Only the task owner or an admin can delete this task');
    }
    await taskRepository.delete(taskId);
  },

  getMyStats: (currentUser: CurrentUser): Promise<TaskStats> =>
    computeStats({ AND: [{ OR: [{ ownerId: currentUser.id }, { assignedUserId: currentUser.id }] }] }),

  getGlobalStats: (): Promise<TaskStats> => computeStats({}),
};
