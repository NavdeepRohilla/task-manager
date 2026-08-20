import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TaskStats } from '@/types/task';
import { EmptyChart } from './EmptyChart';

interface CategoryBarChartProps {
  byCategory: TaskStats['byCategory'];
}

export function CategoryBarChart({ byCategory }: CategoryBarChartProps) {
  if (byCategory.length === 0) {
    return <EmptyChart message="No categories yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dadee2" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#dadee2' }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#f5a623" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
