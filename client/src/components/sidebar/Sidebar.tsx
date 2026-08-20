import { NavLink } from 'react-router';
import {
  LayoutDashboard,
  ListChecks,
  KanbanSquare,
  CalendarDays,
  User,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'My Tasks', icon: ListChecks },
  { to: '/kanban', label: 'Kanban', icon: KanbanSquare },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <aside className="hidden w-56 shrink-0 flex-col bg-board text-flap lg:flex">
      <div className="px-5 py-6">
        <span className="flap-chip text-signal">TASK MANAGER</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-board-light text-flap' : 'text-flap/60 hover:bg-board-light/60 hover:text-flap'
              )
            }
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
        {role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors',
                isActive ? 'bg-board-light text-flap' : 'text-flap/60 hover:bg-board-light/60 hover:text-flap'
              )
            }
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
