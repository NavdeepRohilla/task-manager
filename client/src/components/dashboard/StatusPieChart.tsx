import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { TaskStats } from '@/types/task';
import { EmptyChart } from './EmptyChart';

interface StatusPieChartProps {
  byStatus: TaskStats['byStatus'];
}

const STATUS_LABEL: Record<string, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

// Board design tokens, inlined - Recharts renders to SVG fill attributes,
// which can't reference Tailwind's CSS custom properties directly.
const STATUS_COLOR: Record<string, string> = {
  TODO: '#dadee2',
  IN_PROGRESS: '#f5a623',
  COMPLETED: '#1b2430',
};

export function StatusPieChart({ byStatus }: StatusPieChartProps) {
  const data = Object.entries(byStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({ status, label: STATUS_LABEL[status] ?? status, count }));

  if (data.length === 0) {
    return <EmptyChart message="No tasks yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={2}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLOR[entry.status] ?? '#6b7280'} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={32} />
      </PieChart>
    </ResponsiveContainer>
  );
}
