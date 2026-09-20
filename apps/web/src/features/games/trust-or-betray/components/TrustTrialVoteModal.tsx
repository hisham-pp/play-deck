'use client';

import React from 'react';

import type { TrustPlayer } from '../types/trust-or-betray.types';

export interface TrustTrialVoteModalProps {
  players: TrustPlayer[];
  localPlayerId: string;
  timeRemaining: number;
  onVote: (accusedId: string | null) => void;
}

export function TrustTrialVoteModal({
  players,
  localPlayerId,
  timeRemaining,
  onVote,
}: TrustTrialVoteModalProps) {
  const eligibleCandidates = players.filter((p) => p.id !== localPlayerId && !p.isExiled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚖️</span>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-100">The Exile Trial</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Cast your secret ballot to exile a suspected saboteur. Majority vote exiles them
                (-80 PTS penalty & 1 round timeout).
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-black text-amber-300">
            ⏱️ {timeRemaining}s
          </div>
        </div>

        {/* Candidate List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto">
          {eligibleCandidates.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between gap-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-slate-700/50"
                  style={{ backgroundColor: `${c.color}20` }}
                >
                  {c.avatar}
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-slate-200 truncate">{c.name}</div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Score: {c.score} • Betrayals: {c.betrayalCount}
                  </div>
                </div>
              </div>

              {/* Trust Bar */}
              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Reputation: {c.trustLevel}</span>
                  <span>{c.trustRating}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      c.trustRating >= 60
                        ? 'bg-emerald-500'
                        : c.trustRating >= 40
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                    }`}
                    style={{ width: `${c.trustRating}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onVote(c.id)}
                className="w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 transition-all cursor-pointer"
              >
                Vote to Exile
              </button>
            </div>
          ))}
        </div>

        {/* Abstain Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onVote(null)}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            Abstain / Skip Vote
          </button>
        </div>
      </div>
    </div>
  );
}
