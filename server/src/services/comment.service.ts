import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { commentRepository } from '../repositories/comment.repository';
import { taskService } from './task.service';
import { CurrentUser } from '../types/express';
import { CommentWithUser } from '../repositories/comment.repository';

export const commentService = {
  addComment: async (taskId: string, currentUser: CurrentUser, message: string): Promise<CommentWithUser> => {
    // Reuses the exact same visibility rule as viewing the task itself —
    // if you can't see the task, you can't comment on it either.
    await taskService.getTaskById(taskId, currentUser);
    return commentRepository.create(taskId, currentUser.id, message);
  },

  listComments: async (taskId: string, currentUser: CurrentUser): Promise<CommentWithUser[]> => {
    await taskService.getTaskById(taskId, currentUser);
    return commentRepository.findByTaskId(taskId);
  },

  deleteComment: async (commentId: string, currentUser: CurrentUser): Promise<void> => {
    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    const isAuthor = comment.userId === currentUser.id;
    const isTaskOwner = comment.task.ownerId === currentUser.id;
    const isAdmin = currentUser.role === Role.ADMIN;

    // The comment's author can remove it, and so can the task's owner
    // (moderating their own task) or an admin.
    if (!isAuthor && !isTaskOwner && !isAdmin) {
      throw ApiError.forbidden('You do not have permission to delete this comment');
    }

    await commentRepository.delete(commentId);
  },
};
