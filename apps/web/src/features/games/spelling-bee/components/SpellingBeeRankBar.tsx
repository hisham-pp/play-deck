'use client';

import React from 'react';

import type { SpellingBeeRank } from '../types/spelling-bee.types';

interface Props {
  score: number;
  maxScore: number;
  currentRank: SpellingBeeRank;
}

const RANKS: { rank: SpellingBeeRank; pct: number }[] = [
  { rank: 'Beginner', pct: 0 },
  { rank: 'Good', pct: 0.1 },
  { rank: 'Solid', pct: 0.2 },
  { rank: 'Great', pct: 0.35 },
  { rank: 'Amazing', pct: 0.5 },
  { rank: 'Genius', pct: 0.7 },
  { rank: 'Queen Bee', pct: 1.0 },
];

export function SpellingBeeRankBar({ score, maxScore, currentRank }: Props) {
  const currentPct = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;
  const nextRank = RANKS.find((r) => r.pct > currentPct);
  const nextPoints = nextRank ? Math.ceil(nextRank.pct * maxScore) - score : 0;

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-sm">{currentRank}</span>
          <span className="text-slate-400">({score} pts)</span>
        </div>
        {nextRank ? (
          <span className="text-slate-400 text-[11px]">
            {nextPoints} pts to <span className="text-slate-200">{nextRank.rank}</span>
          </span>
        ) : (
          <span className="text-amber-400 text-[11px] font-bold">Max Rank Achieved! 👑</span>
        )}
      </div>

      <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden relative">
        <div
          className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
          style={{ width: `${currentPct * 100}%` }}
        />
      </div>

      <div className="flex justify-between items-center px-1 text-[10px] text-slate-500 font-medium">
        <span>Beginner</span>
        <span>Solid</span>
        <span>Genius</span>
        <span>Queen Bee</span>
      </div>
    </div>
  );
}
