import { cn } from '@/lib/utils';

interface FlapChipProps {
  children: React.ReactNode;
  tone?: 'board' | 'signal' | 'muted';
  className?: string;
}

/**
 * The recurring signature element: status/priority rendered like a
 * split-flap board character — mono, uppercase, tight tracking, on a
 * dark chip. Used for task status and priority throughout the app
 * (Phase 4+), and previewed on the landing page hero.
 */
export function FlapChip({ children, tone = 'board', className }: FlapChipProps) {
  const toneClasses = {
    board: 'bg-board text-flap',
    signal: 'bg-signal text-board',
    muted: 'bg-line text-muted',
  } as const;

  return (
    <span className={cn('flap-chip inline-flex items-center rounded-[2px] px-2 py-1', toneClasses[tone], className)}>
      {children}
    </span>
  );
}
