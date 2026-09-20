'use client';

import React from 'react';

import type { AlibiState } from '../types/alibi.types';

interface Props {
  gameState: AlibiState;
  isHost: boolean;
  onTally: () => void;
}

export function AlibiReveal({ gameState, isHost, onTally }: Props) {
  const suspect = gameState.players.find((p) => p.isSuspect);
  const voteCounts: Record<string, number> = {};
  for (const p of gameState.players) {
    if (p.votedForId) voteCounts[p.votedForId] = (voteCounts[p.votedForId] ?? 0) + 1;
  }

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="rounded-xl border border-amber-500/40 bg-surface-raised p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">📋 Reveal</p>
        <p className="text-sm text-deck-300">
          The suspect was: <span className="font-bold text-rose-400">{suspect?.displayName}</span>
        </p>
        {suspect?.storyVariant && suspect.storyVariant.inconsistencies.length > 0 && (
          <div>
            <p className="text-xs text-deck-400 font-semibold mb-1">
              Their story had these differences:
            </p>
            {suspect.storyVariant.inconsistencies.map((inc, i) => (
              <p key={i} className="text-xs text-rose-300">
                • {inc}
              </p>
            ))}
          </div>
        )}
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
