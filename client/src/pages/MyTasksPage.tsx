import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { useTasksQuery, useDeleteTask } from '@/hooks/useTasks';
import { getErrorMessage } from '@/lib/errors';
import type { ListTasksParams, Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Pagination } from '@/components/tasks/Pagination';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';

export default function MyTasksPage() {
  const [params, setParams] = useState<ListTasksParams>({ page: 1, limit: 10 });
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, isError, error } = useTasksQuery(params);
  const deleteMutation = useDeleteTask();

  const handleDelete = (task: Task) => {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    deleteMutation.mutate(task.id, {
      onSuccess: () => toast.success('Task deleted'),
      onError: (err) => toast.error(getErrorMessage(err, 'Could not delete task')),
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">My Tasks</h1>
          <p className="text-sm text-muted">Tasks you own or are assigned to.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <TaskFilters value={params} onChange={setParams} />

      <div className="mt-4 space-y-3">
        {isLoading && <p className="py-8 text-center text-sm text-muted">Loading tasks…</p>}

        {isError && (
          <p className="py-8 text-center text-sm text-danger">{getErrorMessage(error, 'Could not load tasks')}</p>
        )}

        {data?.tasks.length === 0 && (
          <div className="rounded-sm border border-dashed border-line py-12 text-center">
            <p className="text-sm text-muted">No tasks match these filters.</p>
          </div>
        )}

        {data?.tasks.map((task) => (
          <div key={task.id} className="group relative">
            <TaskCard task={task} onClick={() => setActiveTask(task)} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task);
              }}
              className="absolute right-3 top-3 hidden text-xs text-muted hover:text-danger group-hover:block"
              aria-label={`Delete ${task.title}`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {data && (
        <div className="mt-4">
          <Pagination meta={data.pagination} onPageChange={(page) => setParams({ ...params, page })} />
        </div>
      )}

      <TaskFormDialog open={creating} onOpenChange={setCreating} />
      <TaskFormDialog open={activeTask !== null} onOpenChange={(open) => !open && setActiveTask(null)} task={activeTask} />
    </div>
  );
}
