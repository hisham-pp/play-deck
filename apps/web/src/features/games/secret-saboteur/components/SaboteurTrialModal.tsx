'use client';

import React, { useState } from 'react';

import type { SaboteurPlayer } from '../types/secret-saboteur.types';

export interface SaboteurTrialModalProps {
  players: SaboteurPlayer[];
  localPlayerId: string;
  timeRemaining: number;
  onSubmitVote: (accusedId: string | null) => void;
}

export function SaboteurTrialModal({
  players,
  localPlayerId,
  timeRemaining,
  onSubmitVote,
}: SaboteurTrialModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const candidates = players.filter((p) => p.id !== localPlayerId && !p.isDetained);

  const handleVote = () => {
    setSubmitted(true);
    onSubmitVote(selectedTarget);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-1">⚖️</div>
          <h2 className="text-xl font-black text-slate-100 tracking-tight">TRIAL VOTE</h2>
          <p className="text-xs text-slate-400 mt-1">
            Vote to detain a suspected saboteur. Majority wins. A tie means no arrest.
          </p>
        </div>

        <div
          className="text-center text-xs font-mono font-bold"
          style={{ color: timeRemaining <= 5 ? '#ef4444' : '#f59e0b' }}
        >
          Vote closes in {timeRemaining}s
        </div>

        {submitted ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-center text-emerald-400 font-semibold">
            ✅ Vote cast. Awaiting other operatives…
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {candidates.map((p) => (
                <button
                  key={p.id}
                  id={`vote-${p.id}-btn`}
                  onClick={() => setSelectedTarget(p.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-sm transition-all ${
                    selectedTarget === p.id
                      ? 'border-red-500/60 bg-red-950/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl leading-none">{p.avatar}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-200">{p.name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${p.suspicionScore}%`,
                            background:
                              p.suspicionScore > 70
                                ? '#ef4444'
                                : p.suspicionScore > 40
                                  ? '#f59e0b'
                                  : '#10b981',
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {p.suspicionScore}
                      </span>
                    </div>
                  </div>
                  {selectedTarget === p.id && (
                    <span className="text-red-400 font-bold text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                id="abstain-vote-btn"
                onClick={() => {
                  setSubmitted(true);
                  onSubmitVote(null);
                }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all"
              >
                Abstain
              </button>
              <button
                id="confirm-vote-btn"
                onClick={handleVote}
                disabled={!selectedTarget}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                ⚖️ Detain
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
