'use client';

import React from 'react';

import type { TrustPlayer } from '../types/trust-or-betray.types';

export interface TrustVictoryModalProps {
  players: TrustPlayer[];
  winnerId?: string;
  winnerName?: string;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export function TrustVictoryModal({
  players,
  winnerId: _winnerId,
  winnerName: _winnerName,
  onRematch,
  onReturnToLobby,
}: TrustVictoryModalProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const victor = sorted[0];

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col gap-6 text-slate-100 animate-fadeIn">
      {/* Victor Spotlight */}
      <div className="text-center flex flex-col items-center gap-3 border-b border-slate-800 pb-6">
        <span className="px-3 py-1 rounded-full text-xs font-mono font-black tracking-widest uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
          Operation Debriefing Complete
        </span>

        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border-2 border-amber-500/60 flex items-center justify-center text-4xl shadow-xl shadow-amber-950/40 mt-1">
          {victor?.avatar ?? '🏆'}
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
            {victor?.name} Triumphs!
          </h2>
          <p className="text-xs text-amber-300 font-mono mt-1">
            Top Operative with {victor?.score} Points
          </p>
        </div>
      </div>

      {/* Standings Table */}
      <div className="flex flex-col gap-2">
        <div className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold px-3">
          Final Operative Standings
        </div>
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-850">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-3.5 sm:px-5 transition-colors ${
                idx === 0 ? 'bg-amber-950/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 font-mono text-sm font-black text-slate-500">#{idx + 1}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base border border-slate-700/60"
                  style={{ backgroundColor: `${p.color}20` }}
                >
                  {p.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{p.name}</span>
                    {idx === 0 && <span className="text-xs">👑</span>}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Cooperated: {p.cooperationCount} • Betrayed: {p.betrayalCount}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-black font-mono text-amber-400">
                  {p.score} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
                </div>
                <div className="text-[10px] uppercase font-mono text-slate-400">
                  {p.trustLevel} ({p.trustRating}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRematch}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-950/50"
        >
          Play Rematch
        </button>
        <button
          type="button"
          onClick={onReturnToLobby}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
}
