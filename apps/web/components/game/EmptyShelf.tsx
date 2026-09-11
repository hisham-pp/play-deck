import { Compass } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/Button';

interface EmptyShelfProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyShelf({
  title = 'Your game shelf is waiting.',
  description = "Games will appear here as they're added to PlayDeck.",
  actionText = 'Explore games',
  actionHref = '/games',
}: EmptyShelfProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* Subtle arcade spark emblem */}
      <div className="w-12 h-12 rounded-full border border-surface-border bg-surface-raised flex items-center justify-center mb-6 text-amber-500 shadow-sm animate-pulse">
        <span className="text-xl">✦</span>
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-deck-900 dark:text-deck-100 mb-2 font-display">
        {title}
      </h3>

      <p className="text-sm text-deck-500 dark:text-deck-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

      <Link href={actionHref}>
        <Button variant="primary" size="md" className="gap-2">
          <Compass className="w-4 h-4" />
          <span>{actionText}</span>
        </Button>
      </Link>
    </div>
  );
}
