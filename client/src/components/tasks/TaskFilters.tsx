import { Search } from 'lucide-react';
import type { ListTasksParams } from '@/types/task';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface TaskFiltersProps {
  value: ListTasksParams;
  onChange: (next: ListTasksParams) => void;
}

const ALL = '__all__';

export function TaskFilters({ value, onChange }: TaskFiltersProps) {
  const set = <K extends keyof ListTasksParams>(key: K, val: ListTasksParams[K]) =>
    onChange({ ...value, [key]: val, page: 1 }); // any filter change resets to page 1

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-sm border border-line bg-white p-3">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Search tasks…"
          className="pl-9"
          value={value.search ?? ''}
          onChange={(e) => set('search', e.target.value || undefined)}
        />
      </div>

      <Select value={value.status ?? ALL} onValueChange={(v) => set('status', v === ALL ? undefined : (v as ListTasksParams['status']))}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          <SelectItem value="TODO">To do</SelectItem>
          <SelectItem value="IN_PROGRESS">In progress</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={value.priority ?? ALL} onValueChange={(v) => set('priority', v === ALL ? undefined : (v as ListTasksParams['priority']))}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${value.sortBy ?? 'createdAt'}:${value.sortOrder ?? 'desc'}`}
        onValueChange={(v) => {
          const [sortBy, sortOrder] = v.split(':') as [ListTasksParams['sortBy'], ListTasksParams['sortOrder']];
          onChange({ ...value, sortBy, sortOrder, page: 1 });
        }}
      >
        <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt:desc">Newest first</SelectItem>
          <SelectItem value="createdAt:asc">Oldest first</SelectItem>
          <SelectItem value="dueDate:asc">Due date, soonest</SelectItem>
          <SelectItem value="priority:desc">Priority, highest</SelectItem>
          <SelectItem value="title:asc">Title, A–Z</SelectItem>
        </SelectContent>
      </Select>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
        <Checkbox
          checked={value.isArchived ?? false}
          onCheckedChange={(checked) => set('isArchived', checked === true)}
        />
        Show archived
      </label>
    </div>
  );
}
