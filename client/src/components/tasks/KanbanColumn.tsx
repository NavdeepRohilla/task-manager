import { useDroppable } from '@dnd-kit/core';
import type { Task, TaskStatus } from '@/types/task';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onCardClick: (task: Task) => void;
}

export function KanbanColumn({ status, title, tasks, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-full flex-col rounded-sm bg-flap/60 lg:w-1/3">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="flap-chip text-ink">{title}</h3>
        <span className="text-xs text-muted">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn('min-h-[220px] flex-1 space-y-2 p-2 transition-colors', isOver && 'bg-signal/10')}
      >
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onClick={() => onCardClick(task)} />
        ))}
        {tasks.length === 0 && <p className="py-6 text-center text-xs text-muted">No tasks</p>}
      </div>
    </div>
  );
}
