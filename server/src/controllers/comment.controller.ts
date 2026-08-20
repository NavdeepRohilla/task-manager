import { Request, Response } from 'express';
import { getParam } from '../utils/params';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { commentService } from '../services/comment.service';

const requireUser = (req: Request) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  return req.user;
};

export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  const comment = await commentService.addComment(getParam(req, 'id'), currentUser, req.body.message);
  ApiResponse.success(res, 201, 'Comment added', comment);
});

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  const comments = await commentService.listComments(getParam(req, 'id'), currentUser);
  ApiResponse.success(res, 200, 'Comments fetched', comments);
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const currentUser = requireUser(req);
  await commentService.deleteComment(getParam(req, 'id'), currentUser);
  ApiResponse.success(res, 200, 'Comment deleted');
});
