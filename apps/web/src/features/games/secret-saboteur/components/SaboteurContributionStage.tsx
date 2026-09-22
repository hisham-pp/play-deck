'use client';

import React from 'react';

import type {
  ContributionCard,
  SaboteurPlayer,
  SectorMission,
} from '../types/secret-saboteur.types';

export interface SaboteurContributionStageProps {
  localPlayer: SaboteurPlayer | null;
  sector: SectorMission;
  timeRemaining: number;
  activePlayers: SaboteurPlayer[];
  onLockIn: (card: ContributionCard) => void;
}

export function SaboteurContributionStage({
  localPlayer,
  sector,
  timeRemaining,
  activePlayers,
  onLockIn,
}: SaboteurContributionStageProps) {
  const [selected, setSelected] = React.useState<ContributionCard | null>(null);
  const hand = localPlayer?.hand ?? [];
  const isDetained = localPlayer?.isDetained ?? false;
  const lockedIn = localPlayer?.hasLockedIn ?? false;
  const activeNonDetained = activePlayers.filter((p) => !p.isDetained);

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Sector header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
        <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-widest mb-1">
          ⚡ {sector.name}
        </div>
        <p className="text-sm text-slate-400">{sector.description}</p>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-500">Contribution closes in</span>
        <span className="font-bold" style={{ color: timeRemaining <= 5 ? '#ef4444' : '#f59e0b' }}>
          {timeRemaining}s
        </span>
      </div>

      {isDetained ? (
        <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-6 text-center text-red-400 font-semibold">
          🚫 You are detained this round and cannot contribute.
        </div>
      ) : lockedIn ? (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 text-center">
          <div className="text-emerald-400 font-bold text-base mb-1">
            ✅ Card submitted anonymously.
          </div>
          <div className="text-slate-400 text-sm">
            Waiting for {activeNonDetained.filter((p) => !p.hasLockedIn && p.isBot).length}{' '}
            operative(s)…
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 text-center">
            Choose a card. Your selection is anonymous and will be shuffled before reveal.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {hand.map((card) => (
              <button
                key={card.id}
                id={`card-${card.id}`}
                onClick={() => setSelected(card)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-medium transition-all ${
                  selected?.id === card.id
                    ? card.isSabotage
                      ? 'border-red-500 bg-red-950/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                      : 'border-sky-500 bg-sky-950/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : card.isSabotage
                      ? 'border-red-900/60 bg-red-950/20 hover:border-red-700'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                }`}
              >
                <span className="text-3xl">{card.icon}</span>
                <span className="text-slate-200 font-semibold text-xs text-center">
                  {card.title}
                </span>
                <span
                  className="font-black text-base"
                  style={{ color: card.powerDelta >= 0 ? '#10b981' : '#ef4444' }}
                >
                  {card.powerDelta >= 0 ? '+' : ''}
                  {card.powerDelta}%
                </span>
                <span className="text-slate-500 text-[10px] text-center leading-snug">
                  {card.description}
                </span>
              </button>
            ))}
          </div>

          <button
            id="lock-in-card-btn"
            disabled={!selected}
            onClick={() => selected && onLockIn(selected)}
            className="w-full py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
          >
            🔒 Lock In Contribution
          </button>
        </>
      )}

      {/* Operative roster status */}
      <div className="flex flex-wrap gap-2 justify-center mt-2">
        {activeNonDetained.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              p.hasLockedIn
                ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
                : 'border-slate-800 bg-slate-900/60 text-slate-400'
            }`}
            title={p.name}
          >
            <span>{p.avatar}</span>
            <span>{p.hasLockedIn ? '✅' : '⏳'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
