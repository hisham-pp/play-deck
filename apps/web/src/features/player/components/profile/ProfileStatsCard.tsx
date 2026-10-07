import { Flame, Trophy } from 'lucide-react';
import React from 'react';
import type { PlayerStats } from '@playdeck/game-types';

const STAT_LABEL_STYLE = 'text-xs text-deck-400 mt-1';

export function ProfileStatsCard({ stats }: { stats: PlayerStats }) {
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="p-6 rounded-2xl border border-surface-border bg-surface-raised shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-deck-500 font-display">
            Combat & Match Statistics
          </h3>
        </div>
        {stats.favoriteCategory && (
          <span className="text-xs font-mono font-semibold text-amber-400 capitalize px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            Fav: {stats.favoriteCategory}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-center">
        <div className="p-3.5 rounded-xl bg-surface-overlay border border-surface-border">
          <span className="text-2xl font-black text-deck-950 dark:text-white font-display">
            {stats.gamesPlayed}
          </span>
          <p className={STAT_LABEL_STYLE}>Games Played</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-overlay border border-surface-border">
          <span className="text-2xl font-black text-emerald-500 font-display">{stats.wins}</span>
          <p className={STAT_LABEL_STYLE}>Victories ({winRate}%)</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-overlay border border-surface-border">
          <span className="text-2xl font-black text-rose-500 font-display">{stats.losses}</span>
          <p className={STAT_LABEL_STYLE}>Defeats</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-overlay border border-surface-border">
          <span className="text-2xl font-black text-amber-400 font-display">
            {(stats.totalScore ?? 0).toLocaleString()}
          </span>
          <p className={STAT_LABEL_STYLE}>Total Score</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-overlay border border-surface-border">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-5 h-5 text-orange-400 inline" />
            <span className="text-2xl font-black text-orange-400 font-display">
              {stats.bestStreak ?? 0}
            </span>
          </div>
          <p className={STAT_LABEL_STYLE}>Best Win Streak</p>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-overlay border border-surface-border">
          <span className="text-2xl font-black text-indigo-400 font-display">
            {stats.unlockedAchievements?.length ?? 0}
          </span>
          <p className={STAT_LABEL_STYLE}>Badges Earned</p>
        </div>
      </div>
    </div>
  );
}
