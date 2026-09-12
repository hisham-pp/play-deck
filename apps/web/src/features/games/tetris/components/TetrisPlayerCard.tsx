'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player.store';
import type { TetrisGameStatus } from '../types/tetris.types';

export interface TetrisPlayerCardProps {
  status: TetrisGameStatus;
  highScore: number;
}

export function TetrisPlayerCard({ status, highScore }: TetrisPlayerCardProps) {
  const { player } = usePlayerStore();
  const displayName = player?.displayName || 'Player';
  const avatar = player?.avatar || '🕹️';

  const isPlaying = status === 'playing';
  const isGameOver = status === 'game-over';
  const isPaused = status === 'paused';

  const statusLabel = isPlaying
    ? 'STACKING'
    : isPaused
      ? 'PAUSED'
      : isGameOver
        ? 'GAME OVER'
        : 'READY';
  const badgeVariant = isPlaying
    ? 'success'
    : isPaused
      ? 'warning'
      : isGameOver
        ? 'outline'
        : 'neutral';

  return (
    <div
      className={cn(
        'w-full flex flex-col items-center gap-3 p-4 rounded-2xl bg-surface-raised border shadow-arcade transition-all text-center',
        isPlaying
          ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
          : 'border-surface-border',
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-deck-400">
          Pilot
        </span>
        <Badge variant={badgeVariant} size="sm" className="font-mono text-[10px] px-2 py-0.5">
          {statusLabel}
        </Badge>
      </div>

      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center text-3xl shadow-inner">
          {avatar}
        </div>
        {isPlaying && (
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-surface-raised animate-ping" />
        )}
      </div>

      <div className="flex flex-col items-center">
        <span className="text-sm font-bold text-deck-100 truncate max-w-[150px] font-display">
          {displayName}
        </span>
        <span className="text-[11px] text-deck-400 font-mono mt-0.5">
          Best: <strong className="text-amber-400 font-black">{highScore}</strong>
        </span>
      </div>
    </div>
  );
}
