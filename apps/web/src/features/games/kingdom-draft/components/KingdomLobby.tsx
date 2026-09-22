'use client';

import React from 'react';

import {
  MAX_KINGDOM_PLAYERS,
  MIN_KINGDOM_PLAYERS,
  useKingdomMultiplayerStore,
} from '@/stores/kingdom-draft-multiplayer.store';

export interface KingdomLobbyProps {
  onStartGame: () => void;
}

export function KingdomLobby({ onStartGame }: KingdomLobbyProps) {
  const { roomCode, players, addBot, removeBot, isHost } = useKingdomMultiplayerStore();

  const host = isHost();
  const canStart = host && players.length >= MIN_KINGDOM_PLAYERS;
  const canAddBot = players.length < MAX_KINGDOM_PLAYERS;

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full max-w-4xl mx-auto p-6">
      <div className="w-full bg-[#111827] border border-[#232f45] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wider mb-3">
            <span>🏰</span>
            <span>STRATEGY REALM DRAFT</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Kingdom Draft</h1>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Draft provinces, towns, and bastions into a 3x3 kingdom. Align spatial synergies and
            fulfill your secret objective.
          </p>

          {roomCode && (
            <div className="mt-4 inline-flex items-center gap-3 bg-[#1c2438] border border-[#2b3954] rounded-lg px-4 py-2">
              <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                Room Code:
              </span>
              <span className="font-mono text-lg font-bold text-emerald-400 tracking-widest">
                {roomCode}
              </span>
            </div>
          )}
        </div>

        {/* Players Roster */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Governors in Session ({players.length}/{MAX_KINGDOM_PLAYERS})
            </h2>
            {canAddBot && (
              <button
                type="button"
                onClick={addBot}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-medium transition-colors"
              >
                + Add AI Governor
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#1c2438] border border-[#2b3954] hover:border-emerald-500/40 transition-all"
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
                    <div className="text-xs text-slate-400 font-mono">
                      {p.archetype ? `${p.archetype} Strategy` : 'Realm Builder'}
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

        {/* Rules & Synergy Guide */}
        <div className="bg-[#182032] p-5 rounded-xl border border-[#232f45] mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Kingdom Building Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-400">
            <div>
              <strong className="text-emerald-400 block mb-1">Snake Drafting (3 Rounds)</strong>
              Draft 3 cards per round to complete your 3x3 grid (9 tiles total). Pick order reverses
              every round.
            </div>
            <div>
              <strong className="text-emerald-400 block mb-1">
                Spatial Synergies & Objectives
              </strong>
              Place cards adjacent to synergistic neighbors for +2 to +4 point bonuses. Fulfill your
              secret objective for +18 to +20 pts!
            </div>
          </div>
        </div>

        {/* Start Game Action */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={!canStart}
            onClick={onStartGame}
            className={`w-full max-w-sm py-4 rounded-xl font-bold text-base tracking-wide uppercase transition-all shadow-lg ${
              canStart
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold shadow-emerald-500/25 active:scale-[0.98]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {players.length < MIN_KINGDOM_PLAYERS
              ? `Need at least ${MIN_KINGDOM_PLAYERS} Governors`
              : 'Found Kingdom'}
          </button>
          {!host && (
            <p className="text-xs text-slate-400 animate-pulse">Waiting for host to begin...</p>
          )}
        </div>
      </div>
    </div>
  );
}
