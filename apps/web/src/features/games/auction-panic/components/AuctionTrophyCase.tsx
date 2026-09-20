'use client';

import React from 'react';

import { COMBO_SETS } from '../engine/auction-items';
import type { AuctionPlayer } from '../types/auction-panic.types';

export interface AuctionTrophyCaseProps {
  player: AuctionPlayer | null;
}

export function AuctionTrophyCase({ player }: AuctionTrophyCaseProps) {
  if (!player) return null;

  const totalValue = player.wonItems.reduce((acc, i) => acc + i.effectiveValue, 0);
  const playerItemIds = new Set(player.wonItems.map((i) => i.id));

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#111827] border border-[#232f45] rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 border-b border-[#232f45] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Your Trophy Case ({player.wonItems.length} Items)
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-400">
            Total Appraised Value: <strong className="text-amber-400">${totalValue}</strong>
          </span>
          <span className="text-slate-400">
            Bank: <strong className="text-emerald-400">${player.coins}</strong>
          </span>
        </div>
      </div>

      {player.wonItems.length === 0 ? (
        <div className="p-6 text-center text-slate-500 text-xs italic font-mono">
          Your trophy case is empty. Win bids on upcoming lots to display your collection!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {player.wonItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="p-3 rounded-xl bg-[#182032] border border-[#232f45] flex flex-col items-center text-center relative group"
            >
              <div className="text-3xl mb-1.5">{item.icon}</div>
              <div className="text-xs font-bold text-white truncate w-full">{item.name}</div>
              <div className="text-[11px] font-mono font-black text-amber-400">
                ${item.effectiveValue}
              </div>
              {item.wasDoubled && (
                <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 mt-1">
                  2X VALUE
                </span>
              )}
              {item.wasStolen && (
                <span className="text-[9px] font-mono px-1 rounded bg-cyan-500/20 text-cyan-300 mt-1">
                  STOLEN
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Set Combo Progress Tracker */}
      <div className="mt-4 pt-3 border-t border-[#232f45]/60 flex flex-wrap gap-2 items-center">
        <span className="text-[11px] font-mono uppercase text-slate-400 font-bold mr-1">
          Set Combos:
        </span>
        {COMBO_SETS.map((set) => {
          const ownedCount = set.requiredItemIds.filter((id) => playerItemIds.has(id)).length;
          const isComplete = ownedCount === set.requiredItemIds.length;
          return (
            <div
              key={set.id}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                isComplete
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                  : ownedCount > 0
                    ? 'bg-[#1c2438] border-[#2b3954] text-slate-300'
                    : 'bg-[#141b2b] border-[#1f293d] text-slate-500'
              }`}
            >
              {set.name}: {ownedCount}/{set.requiredItemIds.length} (+{set.bonusPoints}pts)
            </div>
          );
        })}
      </div>
    </div>
  );
}
