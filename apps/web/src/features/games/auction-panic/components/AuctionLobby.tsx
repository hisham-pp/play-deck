'use client';

import React from 'react';

import {
  MAX_AUCTION_PLAYERS,
  MIN_AUCTION_PLAYERS,
  useAuctionMultiplayerStore,
} from '@/stores/auction-panic-multiplayer.store';

export interface AuctionLobbyProps {
  onStartGame: () => void;
}

export function AuctionLobby({ onStartGame }: AuctionLobbyProps) {
  const { roomCode, players, roundCount, setRoundCount, addBot, removeBot, isHost } =
    useAuctionMultiplayerStore();

  const host = isHost();
  const canStart = host && players.length >= MIN_AUCTION_PLAYERS;
  const canAddBot = players.length < MAX_AUCTION_PLAYERS;

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-4xl mx-auto p-6">
      <div className="w-full bg-[#111827] border border-[#232f45] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wider mb-3">
            <span>🔨</span>
            <span>HIGH-STAKES MYSTERY AUCTION</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Auction Panic</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Bid on cryptic mystery items, outsmart opponents, trigger set combos, and survive the
            gavel.
          </p>

          {roomCode && (
            <div className="mt-4 inline-flex items-center gap-3 bg-[#1c2438] border border-[#2b3954] rounded-lg px-4 py-2">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                Room Code:
              </span>
              <span className="font-mono text-lg font-bold text-amber-400 tracking-widest">
                {roomCode}
              </span>
            </div>
          )}
        </div>

        {/* Players Roster */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Bidders in the Room ({players.length}/{MAX_AUCTION_PLAYERS})
            </h2>
            {canAddBot && (
              <button
                type="button"
                onClick={addBot}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-medium transition-colors"
              >
                + Add AI Bidder
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c2438] border border-[#2b3954] hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner border border-white/10"
                    style={{ backgroundColor: `${p.color}25` }}
                  >
                    {p.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      {p.name}
                      {p.isBot && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                          BOT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-400/80 font-mono font-medium">
                      ${p.coins} Budget
                    </div>
                  </div>
                </div>

                {p.isBot && (
                  <button
                    type="button"
                    onClick={() => removeBot(p.id)}
                    className="text-slate-500 hover:text-red-400 p-1 text-xs"
                    title="Remove Bot"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Game Rules / Lots Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 bg-[#182032] p-4 rounded-xl border border-[#232f45]">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Auction Lots
            </label>
            <div className="flex gap-2">
              {[5, 7, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRoundCount(count)}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                    roundCount === count
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-sm'
                      : 'bg-[#111827] border-[#2b3954] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {count} Items
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              House Rules
            </span>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Mystery lots with cryptic hints & silhouettes</li>
              <li>• Special rounds: Blind bids, Double-or-Nothing, Steals</li>
              <li>• Collect 3-item sets for massive combo bonuses</li>
            </ul>
          </div>
        </div>

        {/* Start Auction Action */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!canStart}
            onClick={onStartGame}
            className={`w-full max-w-sm py-4 rounded-xl font-bold text-base tracking-wide uppercase transition-all shadow-lg ${
              canStart
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold shadow-amber-500/25 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {players.length < MIN_AUCTION_PLAYERS
              ? `Need at least ${MIN_AUCTION_PLAYERS} Bidders`
              : 'Begin Auction'}
          </button>
          {!host && (
            <p className="text-xs text-slate-400 animate-pulse">Waiting for host to begin...</p>
          )}
        </div>
      </div>
    </div>
  );
}
