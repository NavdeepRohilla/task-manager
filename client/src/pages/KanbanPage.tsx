import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useTasksQuery, useUpdateTaskStatus } from '@/hooks/useTasks';
import type { Task, TaskStatus } from '@/types/task';
import { KanbanColumn } from '@/components/tasks/KanbanColumn';
import { KanbanCard } from '@/components/tasks/KanbanCard';
import { TaskFormDialog } from '@/components/tasks/TaskFormDialog';
import { getErrorMessage } from '@/lib/errors';

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'To do' },
  { status: 'IN_PROGRESS', title: 'In progress' },
  { status: 'COMPLETED', title: 'Done' },
];

const noop = () => {};

export default function KanbanPage() {
  // Kanban shows the whole board, not one page of results — a higher limit
  // stands in for pagination here (proper virtualization is a fast-follow
  // once boards regularly exceed this).
  const { data, isLoading, isError, error } = useTasksQuery({ limit: 100, isArchived: false });
  const updateStatus = useUpdateTaskStatus();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);

  // requires the pointer to move 8px before a drag starts, so a plain
  // click to open a card's details doesn't get swallowed as a drag.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], COMPLETED: [] };
    for (const task of data?.tasks ?? []) {
      grouped[task.status].push(task);
    }
    return grouped;
  }, [data]);

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingTask(data?.tasks.find((t) => t.id === event.active.id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingTask(null);
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id as TaskStatus;
    const task = data?.tasks.find((t) => t.id === active.id);
    if (task && task.status !== newStatus) {
      updateStatus.mutate({ id: task.id, status: newStatus });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Kanban Board</h1>
        <p className="text-sm text-muted">Drag a card to change its status.</p>
      </div>

      {isLoading && <p className="py-12 text-center text-sm text-muted">Loading board…</p>}
      {isError && <p className="py-12 text-center text-sm text-danger">{getErrorMessage(error, 'Could not load board')}</p>}

      {data && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-4 lg:flex-row">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.status}
                status={col.status}
                title={col.title}
                tasks={tasksByStatus[col.status]}
                onCardClick={setActiveTask}
              />
            ))}
          </div>
          <DragOverlay>{draggingTask && <KanbanCard task={draggingTask} onClick={noop} isOverlay />}</DragOverlay>
        </DndContext>
      )}

      <TaskFormDialog open={activeTask !== null} onOpenChange={(open) => !open && setActiveTask(null)} task={activeTask} />
    </div>
  );
}
