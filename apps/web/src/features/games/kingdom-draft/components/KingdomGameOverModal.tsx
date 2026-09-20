'use client';

import React from 'react';

import type { FinalKingdomScore } from '../types/kingdom-draft.types';

export interface KingdomGameOverModalProps {
  scores: FinalKingdomScore[];
  onRestart: () => void;
}

export function KingdomGameOverModal({ scores, onRestart }: KingdomGameOverModalProps) {
  const champion = scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#111827] border border-[#232f45] rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider mb-3">
          <span>👑</span>
          <span>CORONATION &amp; VALUATION</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">The Realms Are Complete!</h1>
        <p className="text-slate-400 text-xs max-w-md mx-auto mb-6">
          Base structures, adjacency synergies, and secret objectives have been revealed.
        </p>

        {/* Champion Podium */}
        {champion && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-b from-[#1c2438] to-[#111827] border border-emerald-500/40 shadow-xl shadow-emerald-500/10 flex flex-col items-center">
            <div className="text-4xl mb-2">👑</div>
            <div className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>{champion.player.avatar}</span>
              <span>{champion.player.name}</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {champion.breakdown.totalScore} Realm Points
            </div>
            <div className="text-xs text-slate-400 mt-1">Sovereign Ruler of the Realm</div>
          </div>
        )}

        {/* Scores Roster */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 mb-8 text-left">
          {scores.map((s) => (
            <div
              key={s.player.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                s.rank === 1
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : 'bg-[#182032] border-[#232f45]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-black w-6 text-slate-400">#{s.rank}</span>
                <span className="text-xl">{s.player.avatar}</span>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {s.player.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 flex flex-wrap gap-2">
                    <span>Base: {s.breakdown.basePoints}</span>
                    <span className="text-emerald-400">
                      Synergies: +{s.breakdown.synergyPoints}
                    </span>
                    {s.objectiveAchieved ? (
                      <span className="text-purple-300 font-bold">
                        Objective: +{s.breakdown.objectivePoints} ({s.player.secretObjective?.title}
                        )
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Objective Missed ({s.player.secretObjective?.title})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="font-mono text-base font-black text-emerald-400">
                {s.breakdown.totalScore} pts
              </div>
            </div>
          ))}
        </div>

        {/* Play Again Button */}
        <button
          type="button"
          onClick={onRestart}
          className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold uppercase text-sm tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
        >
          Found New Realm
        </button>
      </div>
    </div>
  );
}
