import { Link } from 'react-router';
import { LayoutGrid, Gauge, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FlapChip } from '@/components/ui/flap-chip';
import { HeroManifest } from '@/components/layout/HeroManifest';

const FEATURES = [
  {
    icon: LayoutGrid,
    status: 'PHASE 05',
    title: 'Kanban board',
    description: 'Drag tasks across TODO, IN PROGRESS, and DONE — the board updates the moment you let go.',
  },
  {
    icon: Gauge,
    status: 'PHASE 05',
    title: 'Dashboard & analytics',
    description: 'Totals, overdue counts, and weekly progress, scoped to your work or the whole team.',
  },
  {
    icon: ShieldCheck,
    status: 'LIVE',
    title: 'Role-based access',
    description: 'Owners, assignees, and admins each see and edit exactly what they should — nothing more.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="flap-chip text-board">TASK MANAGER</span>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-ink hover:text-signal-dark">
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <FlapChip tone="signal">Now boarding: Phase 3</FlapChip>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Every task, tracked like it's on the board.
          </h1>
          <p className="mt-4 max-w-md text-base text-muted">
            Nothing sits still on a departures board, and nothing should sit still in your task list either. See
            what's due, what's moving, and what's landed — at a glance.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-sm bg-board p-3">
          <HeroManifest />
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-ink">Built for how work actually moves</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="rounded-sm border border-line p-5">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-5 w-5 text-signal-dark" aria-hidden="true" />
                  <FlapChip tone="muted">{feature.status}</FlapChip>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 py-8 text-center text-sm text-muted">
        <p>Task Manager — built in phases, verified at every one.</p>
      </footer>
    </div>
  );
}
