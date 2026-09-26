'use client';

import { Flame, Sparkles } from 'lucide-react';
import React from 'react';
import type { PlayerStats } from '@playdeck/game-types';
import { calculateLevelInfo } from '@/features/player';

interface PlayerLevelCardProps {
  stats: PlayerStats;
}

export function PlayerLevelCard({ stats }: PlayerLevelCardProps) {
  const levelInfo = calculateLevelInfo(stats.xp ?? 0);

  return (
    <div className="p-6 rounded-2xl border border-surface-border bg-surface-raised shadow-xl flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xl font-mono shadow-inner">
            {levelInfo.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400 font-mono">
                Level {levelInfo.level}
              </span>
              <span className="text-xs text-deck-400">·</span>
              <span className="text-xs font-semibold text-deck-300">{levelInfo.title}</span>
            </div>
            <h3 className="text-lg font-black text-deck-950 dark:text-white tracking-tight">
              Player Progression
            </h3>
          </div>
        </div>

        {/* Streak Badge */}
        {(stats.currentStreak ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold font-mono">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>{stats.currentStreak} Win Streak</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-deck-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{levelInfo.totalXp.toLocaleString()} Total XP</span>
          </span>
          <span>
            {levelInfo.currentLevelXp} / {levelInfo.xpNeededForNext} XP to Level{' '}
            {levelInfo.level + 1}
          </span>
        </div>

        <div className="w-full h-3 bg-surface-overlay rounded-full overflow-hidden border border-surface-border p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-deck-400 font-mono">
          <span>{levelInfo.progressPercent}% Completed</span>
          <span>Next Rank: {calculateLevelInfo(levelInfo.nextLevelXp).title}</span>
        </div>
      </div>
    </div>
  );
}
