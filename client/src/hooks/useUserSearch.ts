import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/services/task.service';

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => userApi.search(query || undefined),
    staleTime: 30_000,
  });
}
