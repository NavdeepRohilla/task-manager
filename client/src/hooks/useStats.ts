import { useQuery } from '@tanstack/react-query';
import { taskApi } from '@/services/task.service';
import { taskKeys } from './useTasks';

export function useMyStatsQuery() {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: () => taskApi.stats(),
  });
}
