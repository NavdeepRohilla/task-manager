import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { taskFormSchema, type TaskFormValues } from '@/lib/validation/task.schema';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { useAuthStore } from '@/store/authStore';
import { getTaskPermissions, type EditableTaskField } from '@/lib/taskPermissions';
import { getErrorMessage } from '@/lib/errors';
import type { Task, TaskFormInput } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormField } from '@/components/forms/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { AssigneePicker } from './AssigneePicker';
import { CommentsSection } from './CommentsSection';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Omit (or pass null) to create a new task instead of editing one. */
  task?: Task | null;
}

const toDateInputValue = (iso: string | null): string => (iso ? iso.slice(0, 10) : '');

const emptyValues: TaskFormValues = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'TODO',
  dueDate: '',
  category: '',
  tagsInput: '',
  assignedUserId: '',
};

export function TaskFormDialog({ open, onOpenChange, task = null }: TaskFormDialogProps) {
  const isEditing = task !== null;
  const currentUser = useAuthStore((s) => s.user);
  const permissions = task ? getTaskPermissions(task, currentUser) : null;

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({ resolver: zodResolver(taskFormSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    reset(
      task
        ? {
            title: task.title,
            description: task.description ?? '',
            priority: task.priority,
            status: task.status,
            dueDate: toDateInputValue(task.dueDate),
            category: task.category ?? '',
            tagsInput: task.tags.join(', '),
            assignedUserId: task.assignedUserId ?? '',
          }
        : emptyValues
    );
  }, [open, task, reset]);

  const canEdit = (field: EditableTaskField): boolean => !isEditing || (permissions?.isFieldEditable(field) ?? false);

  const onSubmit = (values: TaskFormValues) => {
    const fullPayload: TaskFormInput = {
      title: values.title,
      description: values.description || null,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      category: values.category || null,
      tags: values.tagsInput ? values.tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
      assignedUserId: values.assignedUserId || null,
    };

    if (isEditing && task) {
      // An assignee (not owner/admin) can only change status/priority — the
      // backend rejects the rest outright, so only send what they're
      // actually allowed to change rather than the whole form.
      const body = permissions?.canEditAll
        ? fullPayload
        : { status: fullPayload.status, priority: fullPayload.priority };

      updateMutation.mutate(
        { id: task.id, input: body },
        {
          onSuccess: () => {
            toast.success('Task updated');
            onOpenChange(false);
          },
          onError: (error) => toast.error(getErrorMessage(error, 'Could not update task')),
        }
      );
    } else {
      createMutation.mutate(fullPayload, {
        onSuccess: () => {
          toast.success('Task created');
          onOpenChange(false);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Could not create task')),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit task' : 'New task'}</DialogTitle>
          {isEditing && permissions?.canEditStatusOnly && (
            <DialogDescription>
              You're assigned to this task — you can update its status and priority.
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Title" htmlFor="title" error={errors.title?.message}>
            <Input id="title" disabled={!canEdit('title')} aria-invalid={!!errors.title} {...register('title')} />
          </FormField>

          <FormField label="Description" htmlFor="description" error={errors.description?.message}>
            <Textarea id="description" rows={3} disabled={!canEdit('description')} {...register('description')} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priority" htmlFor="priority">
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!canEdit('priority')}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField label="Status" htmlFor="status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!canEdit('status')}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Due date" htmlFor="dueDate">
              <Input id="dueDate" type="date" disabled={!canEdit('dueDate')} {...register('dueDate')} />
            </FormField>
            <FormField label="Category" htmlFor="category" error={errors.category?.message}>
              <Input id="category" disabled={!canEdit('category')} {...register('category')} />
            </FormField>
          </div>

          <FormField label="Tags" htmlFor="tagsInput">
            <Input
              id="tagsInput"
              placeholder="comma, separated, tags"
              disabled={!canEdit('tags')}
              {...register('tagsInput')}
            />
          </FormField>

          <FormField label="Assignee" htmlFor="assignedUserId">
            <Controller
              control={control}
              name="assignedUserId"
              render={({ field }) => (
                <AssigneePicker
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={!canEdit('assignedUserId')}
                />
              )}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create task'}
          </Button>
        </form>

        {isEditing && task && (
          <div className="mt-6 border-t border-line pt-6">
            <CommentsSection taskId={task.id} canModerate={permissions?.canEditAll ?? false} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
