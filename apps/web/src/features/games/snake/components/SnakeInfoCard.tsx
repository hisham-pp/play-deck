'use client';

import { Trophy, Zap } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { SnakeDifficulty } from '../types/snake.types';

export interface SnakeInfoCardProps {
  score: number;
  highScore: number;
  speedMs: number;
  difficulty: SnakeDifficulty;
  gridSize: number;
}

const ICON_XS = 'w-3 h-3 text-amber-500';

export function SnakeInfoCard({
  score,
  highScore,
  speedMs,
  difficulty,
  gridSize,
}: SnakeInfoCardProps) {
  const speedLevel = Math.min(10, Math.max(1, Math.round((145 - speedMs) / 8) + 1));

  return (
    <div className="w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-raised/80 border border-surface-border shadow-arcade text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-deck-400 uppercase tracking-widest font-mono">
          Run Stats
        </span>
        <Badge variant="arcade" size="sm" className="font-mono text-[10px] capitalize px-2 py-0.5">
          {difficulty}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-base/80 border border-surface-border">
          <span className="text-[10px] uppercase tracking-wider text-deck-500 font-semibold">
            Score
          </span>
          <span className="text-xl font-black font-mono text-amber-400 leading-tight">{score}</span>
        </div>

        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-base/80 border border-surface-border">
          <span className="text-[10px] uppercase tracking-wider text-deck-500 font-semibold flex items-center gap-1">
            <Trophy className={ICON_XS} />
            <span>Best</span>
          </span>
          <span className="text-xl font-black font-mono text-deck-200 leading-tight">
            {highScore}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between p-2 rounded-xl bg-surface-overlay/50 border border-surface-border text-[11px]">
        <div className="flex items-center gap-1.5 text-deck-400">
          <Zap className={ICON_XS} />
          <span>Speed:</span>
          <strong className="text-deck-200 font-mono">LVL {speedLevel}</strong>
        </div>
        <span className="text-[10px] font-mono text-deck-500">
          {gridSize}x{gridSize}
        </span>
      </div>
    </div>
  );
}
