'use client';

import React from 'react';

import type { LotOutcome } from '../engine/auction-engine';

export interface AuctionItemRevealStageProps {
  outcome: LotOutcome | null;
  roundIndex: number;
}

const RARITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  legendary: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  rare: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  uncommon: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  common: { bg: 'bg-slate-700/40', text: 'text-slate-300', border: 'border-slate-600' },
  cursed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
};

export function AuctionItemRevealStage({ outcome, roundIndex }: AuctionItemRevealStageProps) {
  if (!outcome) return null;

  const { revealedItem, winnerId, winningBid, effectiveValue, isDoubleOrNothing } = outcome;
  const winner = outcome.updatedPlayers.find((p) => p.id === winnerId);
  const netProfit = effectiveValue - winningBid;
  const isProfit = netProfit >= 0;

  const rarityMeta = RARITY_STYLES[revealedItem.rarity] ?? RARITY_STYLES['common']!;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col items-center justify-center min-h-[550px]">
      <div className="w-full bg-[#111827] border border-[#232f45] rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
        {/* Glow backdrop based on item outcome */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 blur-3xl pointer-events-none ${
            revealedItem.isCursed || revealedItem.isJunk ? 'bg-red-500/10' : 'bg-amber-500/15'
          }`}
        />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c2438] border border-[#2b3954] text-xs font-mono font-bold tracking-wider mb-4">
          <span>🔨</span>
          <span>LOT #{roundIndex} HAMMER DROPPED!</span>
        </div>

        {/* Winner Callout */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-300">
            Sold to{' '}
            <span className="text-amber-400 font-extrabold">{winner ? winner.name : 'Nobody'}</span>{' '}
            for <span className="font-mono text-white font-black">${winningBid}</span>
          </h2>
        </div>

        {/* Revealed Item Box */}
        <div className="my-6 p-6 rounded-2xl bg-gradient-to-b from-[#1c2438] to-[#111827] border border-[#2b3954] shadow-inner flex flex-col items-center">
          <div className="w-24 h-24 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-5xl mb-3 shadow-lg transform hover:scale-105 transition-transform">
            {revealedItem.icon}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border ${rarityMeta.bg} ${rarityMeta.text} ${rarityMeta.border}`}
            >
              {revealedItem.rarity}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {revealedItem.category}
            </span>
          </div>

          <h3 className="text-2xl font-black text-white mb-2">{revealedItem.name}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            {revealedItem.crypticDescription}
          </p>

          {/* Value Breakdown */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-2 pt-4 border-t border-[#232f45]">
            <div className="p-2.5 rounded-xl bg-[#0f1422] border border-[#232f45]">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Appraised Value
              </div>
              <div className="text-lg font-black font-mono text-white">
                ${effectiveValue}
                {isDoubleOrNothing && <span className="text-xs text-amber-400 ml-1">(2X)</span>}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0f1422] border border-[#232f45]">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Net Result
              </div>
              <div
                className={`text-lg font-black font-mono ${
                  isProfit ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isProfit ? `+$${netProfit}` : `-$${Math.abs(netProfit)}`}
              </div>
            </div>
          </div>
        </div>

        {/* Warning or Set Combo Notice */}
        {revealedItem.isCursed && (
          <div className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3 mb-2">
            ⚠️ CURSED ITEM: Causes -${revealedItem.penalty} penalty at scoring!
          </div>
        )}

        {revealedItem.isJunk && (
          <div className="text-xs font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/30 rounded-lg py-2 px-3 mb-2">
            🥫 YOU BOUGHT JUNK! Worthless attic scraps.
          </div>
        )}

        <div className="text-xs text-slate-500 font-mono mt-4 animate-pulse">
          Next lot going up momentarily...
        </div>
      </div>
    </div>
  );
}
