import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { FlapChip } from '@/components/ui/flap-chip';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Clear client state even if the network call fails — the user
      // clicked logout, so the UI should reflect that unconditionally.
      clearAuth();
      navigate('/login', { replace: true });
      toast.success('Logged out');
    },
  });

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-6">
      <FlapChip tone="muted" className="lg:hidden">
        TASK MANAGER
      </FlapChip>
      <div className="ml-auto flex items-center gap-4">
        {user && (
          <div className="text-right">
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="text-xs text-muted">{user.role === 'ADMIN' ? 'Administrator' : 'Member'}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
