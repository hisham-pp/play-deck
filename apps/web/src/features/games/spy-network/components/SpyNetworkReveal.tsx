'use client';

import React from 'react';

import type { SpyNetworkPlayer, SpyNetworkState } from '../types/spy-network.types';

interface Props {
  gameState: SpyNetworkState;
  localPlayer: SpyNetworkPlayer | undefined;
  spyGuess: string;
  locations: string[];
  onSpyGuessChange: (v: string) => void;
  onSpyGuessSubmit: () => void;
  onTally: () => void;
  isHost: boolean;
}

export function SpyNetworkReveal({
  gameState,
  localPlayer,
  spyGuess,
  locations,
  onSpyGuessChange,
  onSpyGuessSubmit,
  onTally,
  isHost,
}: Props) {
  const spy = gameState.players.find((p) => p.isSpy);
  const voteCounts: Record<string, number> = {};
  for (const p of gameState.players) {
    if (p.votedForId) voteCounts[p.votedForId] = (voteCounts[p.votedForId] ?? 0) + 1;
  }

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="rounded-xl border border-amber-500/40 bg-surface-raised p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Reveal</p>
        <p className="text-sm text-deck-300">
          Location: <span className="font-bold text-white">{gameState.location}</span>
        </p>
        <p className="text-sm text-deck-300">
          The Spy was: <span className="font-bold text-rose-400">{spy?.displayName}</span>
        </p>

        <div className="space-y-1">
          <p className="text-xs text-deck-400 font-semibold uppercase tracking-wider">Vote Tally</p>
          {gameState.players.map((p) => (
            <div key={p.id} className="flex justify-between text-sm text-deck-200">
              <span>{p.displayName}</span>
              <span className="font-bold text-amber-400">{voteCounts[p.id] ?? 0} votes</span>
            </div>
          ))}
        </div>
      </div>

      {localPlayer?.isSpy && gameState.spyGuessResult === null && (
        <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-3">
          <p className="text-sm font-bold text-white">Spy: Guess the location for bonus points!</p>
          <select
            className="w-full rounded-lg bg-surface-base border border-surface-border text-sm text-deck-200 p-2"
            value={spyGuess}
            onChange={(e) => onSpyGuessChange(e.target.value)}
          >
            <option value="">Select location…</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <button
            onClick={onSpyGuessSubmit}
            disabled={!spyGuess}
            className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-surface-base font-bold text-sm transition-colors"
          >
            Confirm Guess
          </button>
        </div>
      )}

      {gameState.spyGuessResult && (
        <p
          className={`text-center text-sm font-bold ${gameState.spyGuessResult === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          {gameState.spyGuessResult === 'correct'
            ? '✅ Spy guessed correctly! +150 pts bonus'
            : '❌ Spy guessed wrong!'}
        </p>
      )}

      {isHost && (
        <button
          onClick={onTally}
          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-surface-base font-black text-sm uppercase tracking-wider transition-colors"
        >
          Finalize Scores →
        </button>
      )}
    </div>
  );
}
