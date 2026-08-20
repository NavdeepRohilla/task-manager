import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { FlapChip } from '@/components/ui/flap-chip';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-board px-6 text-center text-flap">
      <FlapChip tone="signal">404</FlapChip>
      <h1 className="mt-6 font-display text-3xl font-semibold">Not on the board.</h1>
      <p className="mt-2 max-w-sm text-sm text-flap/60">
        This route never made the manifest. It may have moved, or never existed.
      </p>
      <Link to="/" className="mt-8">
        <Button variant="primary">Back to the board</Button>
      </Link>
    </div>
  );
}
