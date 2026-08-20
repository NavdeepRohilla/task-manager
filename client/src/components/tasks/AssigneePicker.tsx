import { useUserSearch } from '@/hooks/useUserSearch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// Radix Select forbids an item with value="" (reserved for the placeholder
// state), so "no assignee" needs a real sentinel value instead.
const UNASSIGNED = '__unassigned__';

interface AssigneePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AssigneePicker({ value, onChange, disabled }: AssigneePickerProps) {
  const { data: users, isLoading } = useUserSearch('');

  return (
    <Select
      value={value || UNASSIGNED}
      onValueChange={(v) => onChange(v === UNASSIGNED ? '' : v)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {isLoading && <div className="px-3 py-2 text-sm text-muted">Loading…</div>}
        {users?.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
