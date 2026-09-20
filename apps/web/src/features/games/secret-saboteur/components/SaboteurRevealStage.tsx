'use client';

import React, { useEffect, useState } from 'react';

import type { RoundContribution, RoundSummary } from '../types/secret-saboteur.types';

export interface SaboteurRevealStageProps {
  roundSummary: RoundSummary | null;
  timeRemaining: number;
  onContinue: () => void;
}

export function SaboteurRevealStage({
  roundSummary,
  timeRemaining,
  onContinue,
}: SaboteurRevealStageProps) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (!roundSummary) return;
    setRevealed(0);
    const total = roundSummary.contributions.length;
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setRevealed(idx);
      if (idx >= total) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [roundSummary]);

  if (!roundSummary) return null;

  const { contributions, netPowerDelta, meltdownAdded } = roundSummary;
  const allRevealed = revealed >= contributions.length;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-100">📋 Contribution Reveal</h2>
        <p className="text-xs text-slate-500">Contributions were anonymous and shuffled.</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
        {contributions.map((card: RoundContribution, idx: number) => (
          <div
            key={`${card.id}-${idx}`}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all duration-500 ${
              idx < revealed
                ? card.isSabotage
                  ? 'border-red-500/50 bg-red-950/30 opacity-100 scale-100'
                  : 'border-sky-500/40 bg-sky-950/20 opacity-100 scale-100'
                : 'border-slate-800 bg-slate-900/40 opacity-30 scale-95'
            }`}
          >
            {idx < revealed ? (
              <>
                <span className="text-2xl">{card.icon}</span>
                <span className="text-[10px] font-semibold text-slate-300">{card.title}</span>
                <span
                  className="font-black text-sm"
                  style={{ color: card.powerDelta >= 0 ? '#10b981' : '#ef4444' }}
                >
                  {card.powerDelta >= 0 ? '+' : ''}
                  {card.powerDelta}%
                </span>
              </>
            ) : (
              <span className="text-2xl">🃏</span>
            )}
          </div>
        ))}
      </div>

      {allRevealed && (
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <div
            className="text-2xl font-black mb-1"
            style={{ color: netPowerDelta >= 0 ? '#10b981' : '#ef4444' }}
          >
            {netPowerDelta >= 0 ? '+' : ''}
            {netPowerDelta}% Net Power Delta
          </div>
          {meltdownAdded && (
            <div className="text-red-400 font-bold text-sm mt-2 animate-pulse">
              ☢️ CRITICAL MELTDOWN DETECTED — Strike added!
            </div>
          )}
          {!meltdownAdded && netPowerDelta > 0 && (
            <div className="text-emerald-400 font-semibold text-sm mt-2">
              ✅ Reactor progress advancing!
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between w-full">
        <span className="text-xs text-slate-500 font-mono">Continuing in {timeRemaining}s</span>
        <button
          id="reveal-continue-btn"
          onClick={onContinue}
          className="px-5 py-2 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
