import { motion, type Variants } from 'motion/react';
import { FlapChip } from '@/components/ui/flap-chip';

interface Row {
  title: string;
  meta: string;
  status: 'TODO' | 'IN PROGRESS' | 'DONE';
}

const ROWS: Row[] = [
  { title: 'Redesign onboarding flow', meta: 'Design · Due Fri', status: 'IN PROGRESS' },
  { title: 'Migrate billing to Stripe', meta: 'Engineering · Due Mon', status: 'TODO' },
  { title: 'Write Q3 board update', meta: 'Ops · Due today', status: 'DONE' },
  { title: 'Audit unused API keys', meta: 'Security · Due next week', status: 'TODO' },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export function HeroManifest() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full overflow-hidden rounded-sm border border-white/10 bg-board-light/50"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 flap-chip text-flap/50">
        <span>Task</span>
        <span>Status</span>
      </div>
      {ROWS.map((row) => (
        <motion.div
          key={row.title}
          variants={item}
          className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4 last:border-0"
        >
          <div className="min-w-0">
            <p className="truncate font-mono text-sm text-flap">{row.title}</p>
            <p className="mt-0.5 truncate text-xs text-flap/50">{row.meta}</p>
          </div>
          <FlapChip tone={row.status === 'DONE' ? 'muted' : 'signal'} className="shrink-0">
            {row.status}
          </FlapChip>
        </motion.div>
      ))}
    </motion.div>
  );
}
