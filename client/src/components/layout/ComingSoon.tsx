import { FlapChip } from '@/components/ui/flap-chip';

interface ComingSoonProps {
  title: string;
  phase: string;
  description: string;
}

export function ComingSoon({ title, phase, description }: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-sm border border-dashed border-line text-center">
      <FlapChip tone="muted">{phase}</FlapChip>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}
