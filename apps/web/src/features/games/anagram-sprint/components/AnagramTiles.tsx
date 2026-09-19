'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface AnagramTilesProps {
  letters: string;
  /** Dims the tray once the seat is home or out of guesses. */
  isDimmed?: boolean;
}

/**
 * The scrambled letters, at display size. Each tile is decorative on its own —
 * the tray carries one label that spells the letters out, so a screen reader
 * hears "r, u, t, a, e, e, s" rather than seven unlabelled boxes.
 */
export function AnagramTiles({ letters, isDimmed = false }: AnagramTilesProps) {
  const tiles = [...letters];

  return (
    <div
      role="img"
      aria-label={
        tiles.length > 0 ? `Letters: ${tiles.join(', ').toUpperCase()}` : 'Waiting for letters'
      }
      className={cn(
        'flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 transition-opacity',
        isDimmed && 'opacity-40',
      )}
    >
      {tiles.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          aria-hidden="true"
          className="flex h-12 w-10 sm:h-16 sm:w-14 items-center justify-center rounded-xl border-2 border-amber-500/40 bg-amber-500/10 font-display text-2xl sm:text-4xl font-black uppercase leading-none text-amber-600 shadow-arcade dark:text-amber-300"
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
