'use client';

import { ArrowLeft, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface SnakeScoreboardProps {
  score: number;
  highScore: number;
  speedMs: number;
}

export function SnakeScoreboard({ score, highScore, speedMs }: SnakeScoreboardProps) {
  // Speed level 1 to 10
  const speedLevel = Math.min(10, Math.max(1, Math.round((145 - speedMs) / 8) + 1));

  return (
    <div className="w-full flex flex-col gap-3 pb-3 border-b border-surface-border">
      <div>
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Games</span>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-deck-950 dark:text-white font-display tracking-tight leading-none">
            Snake
          </h1>
          <p className="text-xs text-deck-500 mt-0.5">Classic arcade game</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deck-400">
              Score
            </span>
            <span className="text-xl font-mono font-black text-amber-500 leading-none">
              {score}
            </span>
          </div>

          <div className="h-8 w-px bg-surface-border" />

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deck-400 flex items-center gap-1">
              <Trophy className="w-2.5 h-2.5 text-amber-500" />
              <span>Best</span>
            </span>
            <span className="text-xl font-mono font-black text-deck-800 dark:text-deck-200 leading-none">
              {highScore}
            </span>
          </div>

          <div className="h-8 w-px bg-surface-border hidden sm:block" />

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-wider text-deck-400 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5 text-amber-500" />
              <span>Speed</span>
            </span>
            <span className="text-xs font-mono font-bold text-deck-500 leading-none mt-1">
              LVL {speedLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
