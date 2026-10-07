'use client';

import { CheckCircle2, Lock, Medal } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import type { PlayerStats } from '@playdeck/game-types';
import { ACHIEVEMENTS } from '@/features/player';

interface AchievementsCardProps {
  stats: PlayerStats;
}

export function AchievementsCard({ stats }: AchievementsCardProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedSet = useMemo(
    () => new Set(stats.unlockedAchievements ?? []),
    [stats.unlockedAchievements],
  );

  const achievementsList = useMemo(() => {
    return ACHIEVEMENTS.map((ach) => {
      const isUnlocked = unlockedSet.has(ach.id);
      const data = stats.achievementsData?.[ach.id];

      // Calculate progress percentage
      let currentProgress = data?.progress ?? 0;
      if (isUnlocked) {
        currentProgress = ach.maxProgress ?? 1;
      }

      const progressPercent = ach.maxProgress
        ? Math.min(100, Math.round((currentProgress / ach.maxProgress) * 100))
        : isUnlocked
          ? 100
          : 0;

      return {
        ...ach,
        isUnlocked,
        unlockedAt: data?.unlockedAt,
        currentProgress,
        progressPercent,
      };
    });
  }, [unlockedSet, stats.achievementsData]);

  const filteredList = useMemo(() => {
    if (filter === 'unlocked') {
      return achievementsList.filter((a) => a.isUnlocked);
    }
    if (filter === 'locked') {
      return achievementsList.filter((a) => !a.isUnlocked);
    }
    return achievementsList;
  }, [filter, achievementsList]);

  const unlockedCount = achievementsList.filter((a) => a.isUnlocked).length;

  return (
    <div className="p-6 rounded-2xl border border-surface-border bg-surface-raised shadow-xl flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Medal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-deck-950 dark:text-white tracking-tight">
              Badges & Achievements
            </h3>
            <p className="text-xs text-deck-400">
              {unlockedCount} of {ACHIEVEMENTS.length} milestones unlocked
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-surface-overlay rounded-lg border border-surface-border text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              filter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-deck-400 hover:text-deck-200'
            }`}
          >
            All ({achievementsList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              filter === 'unlocked'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-deck-400 hover:text-deck-200'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('locked')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              filter === 'locked'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-deck-400 hover:text-deck-200'
            }`}
          >
            In Progress ({achievementsList.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredList.map((ach) => (
          <div
            key={ach.id}
            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
              ach.isUnlocked
                ? 'bg-amber-500/10 border-amber-500/40 text-deck-100 shadow-sm'
                : 'bg-surface-overlay border-surface-border text-deck-400 opacity-80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 border ${
                  ach.isUnlocked
                    ? 'bg-amber-500/20 border-amber-500/50 shadow-inner'
                    : 'bg-surface-raised border-surface-border grayscale opacity-60'
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-deck-100 tracking-tight">{ach.title}</h4>
                  <span className="text-[10px] font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                    +{ach.xpReward} XP
                  </span>
                </div>

                <p className="text-xs text-deck-400 leading-snug">{ach.description}</p>
              </div>
            </div>

            {/* Progress or Unlock timestamp */}
            <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono">
              {ach.isUnlocked ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Unlocked</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-deck-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>
                    {ach.currentProgress} / {ach.maxProgress}
                  </span>
                </span>
              )}

              {/* Progress bar for locked */}
              {!ach.isUnlocked && ach.maxProgress && ach.maxProgress > 1 && (
                <div className="w-24 h-1.5 bg-surface-raised rounded-full overflow-hidden border border-surface-border">
                  <div
                    className="h-full bg-amber-400/80 rounded-full"
                    style={{ width: `${ach.progressPercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
