import { MessageSquare, Calendar } from 'lucide-react';
import type { Task } from '@/types/task';
import { FlapChip } from '@/components/ui/flap-chip';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const STATUS_LABEL: Record<Task['status'], string> = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN PROGRESS',
  COMPLETED: 'DONE',
};

const isOverdue = (task: Task): boolean =>
  !!task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

export function TaskCard({ task, onClick }: TaskCardProps) {
  const overdue = isOverdue(task);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 rounded-sm border border-line bg-white p-4 text-left transition-colors hover:border-signal"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn('truncate font-medium text-ink', task.status === 'COMPLETED' && 'text-muted line-through')}>
            {task.title}
          </p>
          {task.isArchived && <FlapChip tone="muted">ARCHIVED</FlapChip>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          {task.category && <span>{task.category}</span>}
          {task.dueDate && (
            <span className={cn('flex items-center gap-1', overdue && 'font-medium text-danger')}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
              {overdue && ' · overdue'}
            </span>
          )}
          {task.assignedUser && <span>Assigned to {task.assignedUser.name}</span>}
          {task._count.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <FlapChip tone="muted">{task.priority}</FlapChip>
        <FlapChip tone={task.status === 'COMPLETED' ? 'muted' : 'signal'}>{STATUS_LABEL[task.status]}</FlapChip>
      </div>
    </button>
  );
}
