import { ListChecks, CheckCircle2, Clock, Flame, AlertTriangle } from 'lucide-react';
import type { TaskStats } from '@/types/task';
import { StatCard } from './StatCard';
import { StatusPieChart } from './StatusPieChart';
import { CategoryBarChart } from './CategoryBarChart';
import { WeeklyProgressChart } from './WeeklyProgressChart';

interface DashboardStatsProps {
  stats: TaskStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total tasks" value={stats.totalTasks} icon={ListChecks} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} />
        <StatCard label="High priority" value={stats.highPriority} icon={Flame} />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-sm border border-line bg-white p-4">
          <h3 className="font-display text-sm font-semibold text-ink">Tasks per status</h3>
          <StatusPieChart byStatus={stats.byStatus} />
        </div>
        <div className="rounded-sm border border-line bg-white p-4">
          <h3 className="font-display text-sm font-semibold text-ink">Tasks per category</h3>
          <CategoryBarChart byCategory={stats.byCategory} />
        </div>
        <div className="rounded-sm border border-line bg-white p-4">
          <h3 className="font-display text-sm font-semibold text-ink">Weekly progress</h3>
          <WeeklyProgressChart weeklyProgress={stats.weeklyProgress} />
        </div>
      </div>
    </div>
  );
}
