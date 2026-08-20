import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ManifestPanel } from '@/components/layout/ManifestPanel';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:block">
        <ManifestPanel />
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 lg:hidden">
          <Link to="/" className="flap-chip text-board">
            TASK MANAGER
          </Link>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
