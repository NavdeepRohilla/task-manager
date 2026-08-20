import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/task';
import { FlapChip } from '@/components/ui/flap-chip';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  /** True only for the ghost card rendered inside DragOverlay - skips drag wiring, since it isn't a drop target itself. */
  isOverlay?: boolean;
}

export function KanbanCard({ task, onClick, isOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: isOverlay,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isOverlay ? {} : listeners)}
      {...(isOverlay ? {} : attributes)}
      onClick={onClick}
      className={cn(
        'cursor-grab select-none rounded-sm border border-line bg-white p-3 text-left shadow-sm active:cursor-grabbing',
        isDragging && 'opacity-30',
        isOverlay && 'rotate-2 shadow-lg'
      )}
    >
      <p className="text-sm font-medium text-ink">{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <FlapChip tone="muted">{task.priority}</FlapChip>
        {task.assignedUser && <span className="truncate text-xs text-muted">{task.assignedUser.name}</span>}
      </div>
    </div>
  );
}
