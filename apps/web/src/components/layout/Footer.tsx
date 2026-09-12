import { Gamepad2 } from 'lucide-react';
import React from 'react';

export function Footer() {
  return (
    <footer className="w-full mt-auto border-t border-surface-border bg-surface-base py-8 text-xs text-deck-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-deck-800 dark:text-deck-200 uppercase tracking-wider">
            PlayDeck
          </span>
          <span>— Modern Game Hub Foundation</span>
        </div>
      </div>
    </footer>
  );
}
