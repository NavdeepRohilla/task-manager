import { useState } from 'react';
import { useMyStatsQuery } from '@/hooks/useStats';
import { useAdminDashboardQuery } from '@/hooks/useAdmin';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/errors';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const [scope, setScope] = useState<'mine' | 'team'>('mine');

  const myStats = useMyStatsQuery();
  const teamStats = useAdminDashboardQuery(isAdmin);

  const active = scope === 'team' && isAdmin ? teamStats : myStats;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-muted">
            {scope === 'team' ? "Every user's tasks, at a glance." : 'Tasks you own or are assigned to.'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex rounded-sm border border-line bg-white p-1">
            {(['mine', 'team'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setScope(option)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                  scope === option ? 'bg-board text-flap' : 'text-muted hover:text-ink'
                )}
              >
                {option === 'mine' ? 'My stats' : 'Team stats'}
              </button>
            ))}
          </div>
        )}
      </div>

      {active.isLoading && <p className="py-12 text-center text-sm text-muted">Loading stats…</p>}
      {active.isError && (
        <p className="py-12 text-center text-sm text-danger">{getErrorMessage(active.error, 'Could not load stats')}</p>
      )}
      {active.data && <DashboardStats stats={active.data} />}
    </div>
  );
}
