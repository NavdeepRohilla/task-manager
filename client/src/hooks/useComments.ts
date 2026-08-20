import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentApi } from '@/services/task.service';

export const commentKeys = {
  list: (taskId: string) => ['tasks', 'detail', taskId, 'comments'] as const,
};

export function useCommentsQuery(taskId: string | null) {
  return useQuery({
    queryKey: commentKeys.list(taskId ?? ''),
    queryFn: () => commentApi.list(taskId as string),
    enabled: taskId !== null,
  });
}

export function useAddComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => commentApi.add(taskId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => commentApi.remove(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}
