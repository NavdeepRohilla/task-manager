import { api } from './api';
import type { ApiSuccessResponse, PublicUserRef } from '@/types/api';
import type { Task, TaskListResult, TaskStats, ListTasksParams, TaskFormInput, Comment } from '@/types/task';

export const taskApi = {
  list: (params: ListTasksParams) =>
    api.get<ApiSuccessResponse<TaskListResult>>('/tasks', { params }).then((res) => res.data.data),

  get: (id: string) => api.get<ApiSuccessResponse<Task>>(`/tasks/${id}`).then((res) => res.data.data),

  create: (input: TaskFormInput) => api.post<ApiSuccessResponse<Task>>('/tasks', input).then((res) => res.data.data),

  update: (id: string, input: Partial<TaskFormInput>) =>
    api.put<ApiSuccessResponse<Task>>(`/tasks/${id}`, input).then((res) => res.data.data),

  remove: (id: string) => api.delete<ApiSuccessResponse<null>>(`/tasks/${id}`).then((res) => res.data),

  stats: () => api.get<ApiSuccessResponse<TaskStats>>('/tasks/stats').then((res) => res.data.data),
};

export const commentApi = {
  list: (taskId: string) => api.get<ApiSuccessResponse<Comment[]>>(`/tasks/${taskId}/comments`).then((res) => res.data.data),

  add: (taskId: string, message: string) =>
    api.post<ApiSuccessResponse<Comment>>(`/tasks/${taskId}/comments`, { message }).then((res) => res.data.data),

  remove: (commentId: string) => api.delete<ApiSuccessResponse<null>>(`/comments/${commentId}`).then((res) => res.data),
};

export const userApi = {
  search: (query?: string) =>
    api.get<ApiSuccessResponse<PublicUserRef[]>>('/users', { params: query ? { search: query } : {} }).then(
      (res) => res.data.data
    ),
};
