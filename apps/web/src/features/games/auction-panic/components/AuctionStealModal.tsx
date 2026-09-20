'use client';

import React, { useState } from 'react';

import type { AuctionPlayer, WonItem } from '../types/auction-panic.types';

export interface AuctionStealModalProps {
  winnerId: string;
  players: AuctionPlayer[];
  localPlayerId: string;
  onStealItem: (stealerId: string, victimId: string, itemId: string) => void;
}

export function AuctionStealModal({
  winnerId,
  players,
  localPlayerId,
  onStealItem,
}: AuctionStealModalProps) {
  const [selectedTarget, setSelectedTarget] = useState<{
    victimId: string;
    item: WonItem;
  } | null>(null);

  const isLocalWinner = winnerId === localPlayerId;
  const winner = players.find((p) => p.id === winnerId);
  const victims = players.filter((p) => p.id !== winnerId && p.wonItems.length > 0);

  const handleConfirmSteal = () => {
    if (!selectedTarget) return;
    onStealItem(winnerId, selectedTarget.victimId, selectedTarget.item.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-[#111827] border border-[#232f45] rounded-2xl p-6 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider mb-2">
            <span>🥷</span>
            <span>STEAL ROUND TRIGGERED!</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {isLocalWinner ? 'Choose an Item to Steal!' : `${winner?.name} is Stealing an Item!`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isLocalWinner
              ? 'As the highest bidder of the Steal Round, snatch any item from an opponent.'
              : 'Wait while the thief makes their selection from the gallery.'}
          </p>
        </div>

        {victims.length === 0 ? (
          <div className="p-8 text-center bg-[#1c2438] rounded-xl border border-[#2b3954] text-slate-400 text-sm">
            None of the opponents own any items to steal! Round passes.
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {victims.map((v) => (
              <div key={v.id} className="p-3.5 bg-[#182032] border border-[#232f45] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{v.avatar}</span>
                    <span>{v.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {v.wonItems.length} items
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {v.wonItems.map((item) => {
                    const isSelected =
                      selectedTarget?.victimId === v.id && selectedTarget?.item.id === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={!isLocalWinner}
                        onClick={() => setSelectedTarget({ victimId: v.id, item })}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                            : 'bg-[#111827] border-[#2b3954] text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="overflow-hidden">
                          <div className="text-xs font-bold truncate">{item.name}</div>
                          <div className="text-[10px] font-mono text-amber-400">
                            ${item.effectiveValue}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {isLocalWinner && (
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#232f45]">
            <button
              type="button"
              disabled={!selectedTarget}
              onClick={handleConfirmSteal}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-all ${
                selectedTarget
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              Snatch Selected Item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
