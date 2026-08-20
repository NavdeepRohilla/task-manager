import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'default' | 'danger';
}

export function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-sm border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <Icon className={cn('h-4 w-4', tone === 'danger' ? 'text-danger' : 'text-signal-dark')} aria-hidden="true" />
      </div>
      <p className={cn('mt-2 font-display text-3xl font-semibold', tone === 'danger' && value > 0 ? 'text-danger' : 'text-ink')}>
        {value}
      </p>
    </div>
  );
}
