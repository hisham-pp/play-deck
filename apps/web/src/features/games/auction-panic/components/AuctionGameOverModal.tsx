'use client';

import React from 'react';

import type { FinalPlayerScore } from '../types/auction-panic.types';

export interface AuctionGameOverModalProps {
  scores: FinalPlayerScore[];
  onRestart: () => void;
}

export function AuctionGameOverModal({ scores, onRestart }: AuctionGameOverModalProps) {
  const champion = scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#111827] border border-[#232f45] rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/20 blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider mb-3">
          <span>🏆</span>
          <span>AUCTION HOUSE CLOSED</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Final Valuation & Results</h1>
        <p className="text-slate-400 text-xs max-w-md mx-auto mb-6">
          Coins remaining, item appraisals, and combo set bonuses have been tallied.
        </p>

        {/* Champion Podium */}
        {champion && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-b from-[#1c2438] to-[#111827] border border-amber-500/40 shadow-xl shadow-amber-500/10 flex flex-col items-center">
            <div className="text-4xl mb-2">👑</div>
            <div className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>{champion.player.avatar}</span>
              <span>{champion.player.name}</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">
              ${champion.finalScore} Net Score
            </div>
            <div className="text-xs text-slate-400 mt-1">Grand Master Collector of the Gallery</div>
          </div>
        )}

        {/* Full Scores Table */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 mb-8 text-left">
          {scores.map((s) => (
            <div
              key={s.player.id}
              className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                s.rank === 1
                  ? 'bg-amber-500/10 border-amber-500/40'
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
                  <div className="text-[10px] font-mono text-slate-400 flex gap-2">
                    <span>Items: ${s.itemsTotalValue}</span>
                    <span>Coins: ${s.coinsRemaining}</span>
                    {s.comboBonusTotal > 0 && (
                      <span className="text-amber-400">Combos: +${s.comboBonusTotal}</span>
                    )}
                    {s.penaltiesTotal > 0 && (
                      <span className="text-red-400">Cursed: -${s.penaltiesTotal}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="font-mono text-base font-black text-amber-400">${s.finalScore}</div>
            </div>
          ))}
        </div>

        {/* Play Again Button */}
        <button
          type="button"
          onClick={onRestart}
          className="px-10 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold uppercase text-sm tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
        >
          Enter Next Auction
        </button>
      </div>
    </div>
  );
}
