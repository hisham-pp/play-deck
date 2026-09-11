import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center text-3xl mb-4">
        🕹️
      </div>
      <h2 className="text-3xl font-black text-deck-950 dark:text-white font-display mb-2">
        404 — Game Not Found
      </h2>
      <p className="text-sm text-deck-500 max-w-sm mb-6">
        The game or screen you were looking for does not exist in the PlayDeck library.
      </p>
      <Link href="/games">
        <Button variant="primary" size="md" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Button>
      </Link>
    </div>
  );
}
