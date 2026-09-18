'use client';

import { Crown, RotateCcw, Settings2 } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import type { PushYourLuckSeat } from '../types/push-your-luck.types';

export interface PushYourLuckResultOverlayProps {
  winner: PushYourLuckSeat | null;
  seats: PushYourLuckSeat[];
  reducedMotion: boolean;
  onNewMatch: () => void;
  onOpenSetup: () => void;
}

export function PushYourLuckResultOverlay({
  winner,
  seats,
  reducedMotion,
  onNewMatch,
  onOpenSetup,
}: PushYourLuckResultOverlayProps) {
  if (!winner) return null;

  const standings = [...seats].sort((a, b) => b.banked - a.banked);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-deck-950/80 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Match result"
    >
      <div
        className={cn(
          'w-full max-w-sm rounded-2xl border border-amber-500/40 bg-surface-raised p-5 shadow-arcade flex flex-col gap-4',
          !reducedMotion && 'animate-in fade-in zoom-in-95 duration-300',
        )}
      >
        <div className="flex flex-col items-center gap-1.5 text-center">
          <Crown className="w-8 h-8 text-amber-400" />
          <h2 className="text-2xl font-black font-display text-deck-950 dark:text-white">
            {winner.name} wins
          </h2>
          <p className="text-xs text-deck-500">
            Banked {winner.banked} points with {winner.busts} bust
            {winner.busts === 1 ? '' : 's'} · best round {winner.bestRound}
          </p>
        </div>

        <ol className="flex flex-col gap-1.5">
          {standings.map((seat, index) => (
            <li
              key={seat.id}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                seat.id === winner.id
                  ? 'border-amber-500/60 bg-amber-500/10'
                  : 'border-surface-border bg-surface-overlay/60',
              )}
            >
              <span className="w-4 text-[11px] tabular-nums text-deck-500">{index + 1}</span>
              <span aria-hidden="true">{seat.avatar}</span>
              <span className="flex-1 min-w-0 truncate font-semibold text-deck-900 dark:text-white">
                {seat.name}
              </span>
              <span className="font-black tabular-nums text-amber-400">{seat.banked}</span>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onNewMatch}
            className="flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Rematch</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSetup}
            className="flex items-center justify-center gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Change table</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
