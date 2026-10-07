'use client';

import { Award, Medal, TrendingUp } from 'lucide-react';
import React from 'react';
import type { PlayerStats } from '@playdeck/game-types';

interface BestScoresCardProps {
  stats: PlayerStats;
}

export function BestScoresCard({ stats }: BestScoresCardProps) {
  const bestScoresEntries = Object.entries(stats.bestScores ?? {}).sort((a, b) => b[1] - a[1]);

  const formatGameName = (id: string) => {
    return id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="p-6 rounded-2xl border border-surface-border bg-surface-raised shadow-xl flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-deck-950 dark:text-white tracking-tight">
              Best Scores & Records
            </h3>
            <p className="text-xs text-deck-400">
              Personal high score records saved to your local browser profile
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-overlay border border-surface-border text-xs font-mono">
          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-deck-400">Total Score:</span>
          <span className="font-bold text-amber-400">
            {(stats.totalScore ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {bestScoresEntries.length === 0 ? (
        <div className="py-8 px-4 rounded-xl border border-dashed border-surface-border text-center flex flex-col items-center gap-2">
          <Medal className="w-8 h-8 text-deck-400/60" />
          <p className="text-sm font-semibold text-deck-300">No high score records yet</p>
          <p className="text-xs text-deck-400 max-w-sm">
            Play games in the arcade catalog and your top personal scores will automatically be
            recorded here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {bestScoresEntries.map(([gameId, score], idx) => (
            <div
              key={gameId}
              className="p-3.5 rounded-xl border border-surface-border bg-surface-overlay flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-deck-400 w-4">{idx + 1}.</span>
                <span className="text-xs font-bold text-deck-200">{formatGameName(gameId)}</span>
              </div>
              <span className="font-mono font-black text-sm text-amber-400">
                {score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
