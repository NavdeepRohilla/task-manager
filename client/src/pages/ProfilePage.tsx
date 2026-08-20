import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FlapChip } from '@/components/ui/flap-chip';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null; // ProtectedRoute guarantees this won't render, but keeps TS honest

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-sm text-muted">Name</span>
            <span className="text-sm font-medium text-ink">{user.name}</span>
          </div>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-sm text-muted">Email</span>
            <span className="text-sm font-medium text-ink">{user.email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="text-sm text-muted">Role</span>
            <FlapChip tone={user.role === 'ADMIN' ? 'signal' : 'board'}>{user.role}</FlapChip>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Member since</span>
            <span className="text-sm font-medium text-ink">{joined}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
