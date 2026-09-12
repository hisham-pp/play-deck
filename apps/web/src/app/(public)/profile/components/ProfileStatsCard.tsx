import { Trophy } from 'lucide-react';
import React from 'react';
import { PlayerStats } from '@playdeck/game-types';

const STAT_LABEL_STYLE = 'text-xs text-deck-400 mt-1';

export function ProfileStatsCard({ stats }: { stats: PlayerStats }) {
  return (
    <div className="p-6 rounded-xl border border-surface-border bg-surface-raised flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-deck-500 font-display">
          Local Stats
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border">
          <span className="text-2xl font-black text-deck-950 dark:text-white font-display">
            {stats.gamesPlayed}
          </span>
          <p className={STAT_LABEL_STYLE}>Games Played</p>
        </div>
        <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border">
          <span className="text-2xl font-black text-emerald-500 font-display">{stats.wins}</span>
          <p className={STAT_LABEL_STYLE}>Victories</p>
        </div>
        <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border">
          <span className="text-2xl font-black text-rose-500 font-display">{stats.losses}</span>
          <p className={STAT_LABEL_STYLE}>Defeats</p>
        </div>
      </div>
    </div>
  );
}
