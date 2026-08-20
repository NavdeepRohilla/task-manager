import { motion, type Variants } from 'motion/react';
import { FlapChip } from '@/components/ui/flap-chip';

interface ManifestRow {
  title: string;
  status: string;
  priority: 'LOW' | 'MED' | 'HIGH';
}

const SAMPLE_ROWS: ManifestRow[] = [
  { title: 'Ship pricing page redesign', status: 'IN PROGRESS', priority: 'HIGH' },
  { title: 'Fix invoice export bug', status: 'TODO', priority: 'MED' },
  { title: 'Q3 retro notes', status: 'DONE', priority: 'LOW' },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/**
 * The board panel: the one signature surface in this design system, reused
 * on every auth screen. Everything else stays quiet by comparison.
 */
export function ManifestPanel() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-board px-10 py-12 text-flap">
      <div>
        <p className="flap-chip text-signal">TASK MANAGER</p>
        <h1 className="mt-4 max-w-sm font-display text-3xl font-semibold leading-tight text-flap">
          Every task, tracked like it's on the board.
        </h1>
        <p className="mt-3 max-w-sm text-sm text-flap/70">
          Nothing sits still. See what's due, what's moving, and what's landed — at a glance.
        </p>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md rounded-sm border border-white/10 bg-board-light/60"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 flap-chip text-flap/50">
          <span>Task</span>
          <span>Status</span>
        </div>
        {SAMPLE_ROWS.map((item) => (
          <motion.div
            key={item.title}
            variants={row}
            className="flex items-center justify-between gap-4 border-b border-white/5 px-4 py-3 last:border-0"
          >
            <span className="truncate font-mono text-sm text-flap/90">{item.title}</span>
            <div className="flex shrink-0 items-center gap-2">
              <FlapChip tone="muted" className="bg-white/10 text-flap/70">
                {item.priority}
              </FlapChip>
              <FlapChip tone="signal">{item.status}</FlapChip>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <p className="flap-chip text-flap/40">PHASE 03 · FOUNDATION</p>
    </div>
  );
}
