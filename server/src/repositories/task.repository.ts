import { Prisma, Priority, TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma';

export const taskInclude = {
  owner: { select: { id: true, name: true, email: true } },
  assignedUser: { select: { id: true, name: true, email: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.TaskInclude;

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof taskInclude;
}>;

export interface TaskStatsRow {
  status: TaskStatus;
  priority: Priority;
  category: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
}

export const taskRepository = {
  create: (
    data: Prisma.TaskUncheckedCreateInput
  ): Promise<TaskWithRelations> =>
    prisma.task.create({
      data,
      include: taskInclude,
    }),

  findById: (id: string): Promise<TaskWithRelations | null> =>
    prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    }),

  findMany: (
    where: Prisma.TaskWhereInput,
    orderBy: Prisma.TaskOrderByWithRelationInput,
    skip: number,
    take: number
  ): Promise<TaskWithRelations[]> =>
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
      include: taskInclude,
    }),

  count: (where: Prisma.TaskWhereInput): Promise<number> =>
    prisma.task.count({ where }),

  update: (
    id: string,
    data: Prisma.TaskUncheckedUpdateInput
  ): Promise<TaskWithRelations> =>
    prisma.task.update({
      where: { id },
      data,
      include: taskInclude,
    }),

  delete: (id: string): Promise<TaskWithRelations> =>
    prisma.task.delete({
      where: { id },
      include: taskInclude,
    }),

  findManyForStats: (
    where: Prisma.TaskWhereInput
  ): Promise<TaskStatsRow[]> =>
    prisma.task.findMany({
      where,
      select: {
        status: true,
        priority: true,
        category: true,
        dueDate: true,
        completedAt: true,
      },
    }),
};