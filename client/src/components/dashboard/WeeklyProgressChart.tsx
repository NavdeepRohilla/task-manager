import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TaskStats } from '@/types/task';
import { EmptyChart } from './EmptyChart';

interface WeeklyProgressChartProps {
  weeklyProgress: TaskStats['weeklyProgress'];
}

const formatDay = (dateStr: string): string => new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' });

export function WeeklyProgressChart({ weeklyProgress }: WeeklyProgressChartProps) {
  const total = weeklyProgress.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) {
    return <EmptyChart message="Nothing completed this week yet" />;
  }

  const data = weeklyProgress.map((d) => ({ ...d, day: formatDay(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dadee2" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#dadee2' }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip labelFormatter={(_, payload) => (payload?.[0] ? new Date(payload[0].payload.date).toLocaleDateString() : '')} />
        <Line type="monotone" dataKey="count" stroke="#1b2430" strokeWidth={2} dot={{ r: 3, fill: '#1b2430' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
