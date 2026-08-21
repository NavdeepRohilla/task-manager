import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';


const commentWithUserInclude = {
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.CommentInclude;

const commentWithTaskInclude = {
  task: { select: { ownerId: true } },
} satisfies Prisma.CommentInclude;

export type CommentWithUser = Prisma.CommentGetPayload<{
  include: typeof commentWithUserInclude;
}>;

export type CommentWithTask = Prisma.CommentGetPayload<{
  include: typeof commentWithTaskInclude;
}>;

export const commentRepository = {
  create: (
    taskId: string,
    userId: string,
    message: string
  ): Promise<CommentWithUser> =>
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

  findById: (id: string): Promise<CommentWithTask | null> =>
    prisma.comment.findUnique({
      where: { id },
      include: commentWithTaskInclude,
    }),

  delete: (id: string): Promise<void> =>
    prisma.comment.delete({ where: { id } }).then(() => undefined),
};