'use client';

import React from 'react';

import { getStreakMultiplier } from '../engine/trust-engine';
import type { MissionObjective } from '../types/trust-or-betray.types';

export interface TrustMissionCardProps {
  round: number;
  totalRounds: number;
  mission: MissionObjective;
  groupPot: number;
  streak: number;
  timeRemaining: number;
  phaseLabel: string;
}

export function TrustMissionCard({
  round,
  totalRounds,
  mission,
  groupPot,
  streak,
  timeRemaining,
  phaseLabel,
}: TrustMissionCardProps) {
  const multiplier = getStreakMultiplier(streak);
  const potentialPot = Math.round(groupPot * multiplier);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Round {round} / {totalRounds}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {mission.category}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold animate-pulse">
            {phaseLabel}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm font-black text-amber-300">
            <span>⏱️</span>
            <span>{timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Mission Body & Pot */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>🎯</span>
            <span>{mission.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            {mission.description}
          </p>
        </div>

        {/* Group Pot Card */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 min-w-[240px] justify-between">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">
              Shared Reward Pool
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-tight">
              {potentialPot}{' '}
              <span className="text-xs font-normal text-slate-400 font-mono">PTS</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">
              Trust Streak
            </div>
            <div className="text-sm font-black text-amber-400 flex items-center justify-end gap-1">
              <span>🔥</span>
              <span>
                {streak} (x{multiplier})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
