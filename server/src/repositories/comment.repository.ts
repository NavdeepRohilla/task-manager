import { Prisma, CommentWithUser, CommentWithTask } from '@prisma/client';
import { prisma } from '../config/prisma';

const commentWithUserInclude = {
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.TaskInclude; // loose stub type; real generated client provides CommentInclude

export const commentRepository = {
  create: (taskId: string, userId: string, message: string): Promise<CommentWithUser> =>
    prisma.comment.create({
      data: { taskId, userId, message },
      include: commentWithUserInclude,
    }),

  findByTaskId: (taskId: string): Promise<CommentWithUser[]> =>
    prisma.comment.findMany({
      where: { taskId },
      include: commentWithUserInclude,
      orderBy: { createdAt: 'asc' },
    }),

  /** Includes the parent task's ownerId so the service can authorize deletes. */
  findById: (id: string): Promise<CommentWithTask | null> =>
    prisma.comment.findUnique({
      where: { id },
      include: { task: { select: { ownerId: true } } },
    }),

  delete: (id: string): Promise<void> => prisma.comment.delete({ where: { id } }).then(() => undefined),
};
