'use client';

import React, { useEffect, useState } from 'react';

import type { AuctionLot, AuctionPlayer } from '../types/auction-panic.types';

export interface AuctionBiddingStageProps {
  currentLot: AuctionLot;
  localPlayer: AuctionPlayer | null;
  players: AuctionPlayer[];
  totalLots: number;
  onPlaceBid: (playerId: string, amount: number) => void;
}

const SPECIAL_ROUND_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  standard: { label: 'Standard Mystery Lot', bg: 'bg-slate-700/40', text: 'text-slate-300' },
  blind: { label: 'Blind Auction (Secret Bids)', bg: 'bg-purple-500/20', text: 'text-purple-300' },
  'forced-bid': { label: 'Forced Bid Round', bg: 'bg-red-500/20', text: 'text-red-300' },
  'double-or-nothing': {
    label: 'Double or Nothing Lot!',
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
  },
  steal: {
    label: 'Steal Round Winner snatches an item!',
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-300',
  },
};

export function AuctionBiddingStage({
  currentLot,
  localPlayer,
  players,
  totalLots,
  onPlaceBid,
}: AuctionBiddingStageProps) {
  const [customBid, setCustomBid] = useState<number>(0);
  const minRequired = Math.max(currentLot.minimumBid, currentLot.currentHighestBid + 10);
  const isBlind = currentLot.specialRound === 'blind';
  const playerCoins = localPlayer?.coins ?? 0;
  const isLeading = currentLot.highestBidderId === localPlayer?.id;

  useEffect(() => {
    setCustomBid(minRequired);
  }, [minRequired]);

  const handleQuickAdd = (increment: number) => {
    const nextVal = Math.min(playerCoins, (customBid || minRequired) + increment);
    setCustomBid(nextVal);
  };

  const handleBidSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!localPlayer) return;
    if (customBid > playerCoins || customBid < minRequired) return;
    onPlaceBid(localPlayer.id, customBid);
  };

  const roundMeta =
    SPECIAL_ROUND_LABELS[currentLot.specialRound] ?? SPECIAL_ROUND_LABELS['standard']!;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 flex flex-col gap-6">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between bg-[#111827] border border-[#232f45] px-6 py-3.5 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase text-slate-400 font-bold">
            Lot {currentLot.lotIndex} / {totalLots}
          </span>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border border-white/10 ${roundMeta.bg} ${roundMeta.text}`}
          >
            {roundMeta.label}
          </span>
        </div>

        {/* Timer */}
        <div
          className={`flex items-center gap-2 font-mono text-xl font-extrabold px-4 py-1.5 rounded-lg border transition-all ${
            currentLot.isTimerUrgent
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
              : 'bg-[#1c2438] border-[#2b3954] text-amber-400'
          }`}
        >
          <span>⏱️</span>
          <span>{currentLot.timeRemaining}s</span>
        </div>
      </div>

      {/* Center Stage: Mystery Lot Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left / Center 2 Cols: Mystery Item Card */}
        <div className="md:col-span-2 bg-[#111827] border border-[#232f45] rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="inline-block text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-[#1c2438] text-amber-400 border border-amber-500/30">
              Category: {currentLot.item.category.replace('-', ' ')}
            </div>
            <div className="font-mono text-xs text-slate-400">
              Min Opening: ${currentLot.minimumBid}
            </div>
          </div>

          {/* Mystery Visual Container */}
          <div className="flex flex-col items-center justify-center my-6 py-8 px-4 rounded-xl bg-gradient-to-b from-[#182032] to-[#0f1422] border border-[#232f45] shadow-inner text-center">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-5xl mb-4 shadow-xl shadow-amber-500/5 group hover:scale-105 transition-transform">
              <span className="filter drop-shadow">{isBlind ? '🔒' : '📦'}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
              {currentLot.specialRound === 'double-or-nothing'
                ? '⚡ 2X Value Mystery Crate'
                : 'Sealed Mystery Lot'}
            </h2>
            <p className="text-sm text-amber-300/90 italic max-w-md">"{currentLot.item.hint}"</p>
          </div>

          {/* Current Highest Bid Ticker */}
          <div className="bg-[#1c2438] border border-[#2b3954] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                Current Highest Bid
              </div>
              <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                {isBlind ? 'HIDDEN (Blind Round)' : `$${currentLot.currentHighestBid || '0'}`}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                Leader
              </div>
              <div className="text-sm font-bold text-white">
                {isBlind ? 'Revealed at Hammer' : currentLot.highestBidderName || 'No Bids Yet'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Bidders Roster & Activity */}
        <div className="bg-[#111827] border border-[#232f45] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Floor Bidders
            </h3>
            <div className="space-y-2.5">
              {players.map((p) => {
                const isTop = currentLot.highestBidderId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isTop
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                        : 'bg-[#182032] border-[#232f45]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <div className="text-xs font-medium text-white truncate max-w-[100px]">
                        {p.name}
                      </div>
                    </div>
                    <div className="font-mono text-xs font-bold text-amber-400/90">${p.coins}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mini Bid Log */}
          <div className="mt-4 pt-3 border-t border-[#232f45]">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 font-semibold">
              Recent Activity
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto font-mono text-[11px] text-slate-400">
              {currentLot.bids.slice(-3).map((b, i) => (
                <div key={i} className="truncate">
                  <span className="text-slate-300 font-bold">{b.playerName}</span> bid{' '}
                  <span className="text-amber-400 font-bold">${b.amount}</span>
                </div>
              ))}
              {currentLot.bids.length === 0 && (
                <div className="text-slate-600 italic">Waiting for opening bid...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bidding Controls Panel */}
      <div className="bg-[#111827] border border-[#232f45] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Your Remaining Budget</div>
            <div className="text-2xl font-black text-white font-mono flex items-center gap-2">
              <span>💰</span>
              <span>${playerCoins}</span>
            </div>
          </div>

          {/* Quick Increment Buttons */}
          <div className="flex items-center gap-2">
            {[10, 25, 50, 100].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => handleQuickAdd(inc)}
                className="px-3 py-1.5 rounded-lg bg-[#1c2438] hover:bg-[#25324d] border border-[#2b3954] text-xs font-mono font-bold text-amber-300 transition-colors"
              >
                +${inc}
              </button>
            ))}
          </div>

          {/* Submit Bid Action */}
          <form onSubmit={handleBidSubmit} className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="number"
              min={minRequired}
              max={playerCoins}
              step={5}
              value={customBid}
              onChange={(e) => setCustomBid(Number(e.target.value))}
              className="w-28 py-3 px-3 rounded-xl bg-[#1c2438] border border-[#2b3954] text-amber-400 font-mono text-center font-bold focus:outline-none focus:border-amber-500"
            />

            <button
              type="submit"
              disabled={isLeading || customBid > playerCoins || customBid < minRequired}
              className={`px-8 py-3.5 rounded-xl font-extrabold uppercase text-sm tracking-wider transition-all shadow-md ${
                isLeading
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 cursor-default'
                  : customBid <= playerCoins && customBid >= minRequired
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isLeading ? 'Highest Bidder!' : `Bid $${customBid}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
