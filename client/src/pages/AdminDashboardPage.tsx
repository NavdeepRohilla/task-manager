import { useState } from 'react';
import { useAdminDashboardQuery } from '@/hooks/useAdmin';
import { getErrorMessage } from '@/lib/errors';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { UserTable } from '@/components/admin/UserTable';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error } = useAdminDashboardQuery();
  const [usersPage, setUsersPage] = useState(1);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
        <p className="text-sm text-muted">Global stats across every user, and account management.</p>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Team overview</h2>
        {isLoading && <p className="py-8 text-center text-sm text-muted">Loading stats…</p>}
        {isError && <p className="py-8 text-center text-sm text-danger">{getErrorMessage(error, 'Could not load stats')}</p>}
        {data && <DashboardStats stats={data} />}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Manage users</h2>
        <UserTable page={usersPage} onPageChange={setUsersPage} />
      </section>
    </div>
  );
}
