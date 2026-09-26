'use client';

import { Award, Heart, Shield, Swords, Wind } from 'lucide-react';
import React from 'react';
import type { PlayerStats } from '../engine/progression';

interface PlayerProgressionCardProps {
  stats: PlayerStats;
  achievementCount: number;
  totalAchievements: number;
}

export function PlayerProgressionCard({
  stats,
  achievementCount,
  totalAchievements,
}: PlayerProgressionCardProps) {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-raised p-3.5 shadow-arcade space-y-3">
      {/* Level & Rank Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 font-mono text-base font-black text-slate-950 shadow-md shadow-amber-500/30">
            {stats.level}
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-[0.2em] text-deck-500 font-semibold">
              <span>Proficiency Level {stats.level}</span>
            </div>
            <div className="text-sm font-black text-white tracking-wide">{stats.title}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-[10px] font-mono text-amber-400 uppercase font-bold">
            <Award className="w-3 h-3" />
            <span>
              {achievementCount}/{totalAchievements} Medals
            </span>
          </div>
          <div className="text-[10px] font-mono text-deck-400">{stats.totalXp} Total XP</div>
        </div>
      </div>

      {/* Level XP Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-deck-400 uppercase">
          <span>Level Progress</span>
          <span>
            {stats.currentXp} / {stats.nextLevelXp} XP ({stats.progressPercent}%)
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Combat Attributes Grid */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-white/5 text-center">
        <div className="rounded-xl border border-surface-border bg-surface-base/80 p-2">
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono text-deck-500">
            <Heart className="w-2.5 h-2.5 text-rose-400" />
            <span>Max HP</span>
          </div>
          <div className="font-mono text-xs font-bold text-white mt-0.5">{stats.maxHealth}</div>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-base/80 p-2">
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono text-deck-500">
            <Swords className="w-2.5 h-2.5 text-amber-400" />
            <span>ATK Pwr</span>
          </div>
          <div className="font-mono text-xs font-bold text-amber-300 mt-0.5">
            +{stats.attackBonus}
          </div>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-base/80 p-2">
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono text-deck-500">
            <Shield className="w-2.5 h-2.5 text-sky-400" />
            <span>Armor</span>
          </div>
          <div className="font-mono text-xs font-bold text-sky-300 mt-0.5">
            +{stats.defenseArmor}
          </div>
        </div>

        <div className="rounded-xl border border-surface-border bg-surface-base/80 p-2">
          <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono text-deck-500">
            <Wind className="w-2.5 h-2.5 text-emerald-400" />
            <span>Agility</span>
          </div>
          <div className="font-mono text-xs font-bold text-emerald-300 mt-0.5">
            {stats.climbSpeed}x
          </div>
        </div>
      </div>
    </div>
  );
}
