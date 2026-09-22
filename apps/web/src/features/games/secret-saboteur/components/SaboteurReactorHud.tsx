'use client';

import React from 'react';

export interface SaboteurReactorHudProps {
  reactorProgress: number;
  meltdownStrikes: number;
  currentRound: number;
  totalRounds: number;
  timeRemaining: number;
  phase: string;
}

const MAX_STRIKES = 3;

const PHASE_LABELS: Record<string, string> = {
  role_reveal: 'Role Briefing',
  briefing: 'Sector Briefing',
  contributing: 'Contributing',
  reveal: 'Card Reveal',
  discussion: 'Discussion',
  trial_vote: 'Trial Vote',
  round_summary: 'Round Summary',
  game_over: 'Mission Complete',
};

export function SaboteurReactorHud({
  reactorProgress,
  meltdownStrikes,
  currentRound,
  totalRounds,
  timeRemaining,
  phase,
}: SaboteurReactorHudProps) {
  const pct = Math.min(100, Math.max(0, reactorProgress));
  const progressColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 shadow-lg">
      {/* Round & Phase */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-slate-400">
          Round{' '}
          <span className="text-amber-400 font-bold">
            {currentRound}/{totalRounds}
          </span>
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-400">{PHASE_LABELS[phase] ?? phase}</span>
        {timeRemaining > 0 && (
          <>
            <span className="text-slate-600">·</span>
            <span
              className="font-bold"
              style={{ color: timeRemaining <= 5 ? '#ef4444' : '#f59e0b' }}
            >
              {timeRemaining}s
            </span>
          </>
        )}
      </div>

      {/* Reactor Progress */}
      <div className="flex-1 min-w-[140px] flex items-center gap-2">
        <span className="text-xs text-slate-400 shrink-0">⚛️</span>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${progressColor}88, ${progressColor})`,
              boxShadow: `0 0 8px ${progressColor}66`,
            }}
          />
        </div>
        <span className="text-xs font-bold shrink-0" style={{ color: progressColor }}>
          {pct}%
        </span>
      </div>

      {/* Meltdown Strikes */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 font-mono">☢️</span>
        <div className="flex gap-1">
          {Array.from({ length: MAX_STRIKES }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border transition-all ${
                i < meltdownStrikes
                  ? 'bg-red-500 border-red-400 shadow-[0_0_6px_#ef4444]'
                  : 'bg-transparent border-slate-700'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-slate-500 font-mono">{meltdownStrikes}/3</span>
      </div>
    </div>
  );
}
