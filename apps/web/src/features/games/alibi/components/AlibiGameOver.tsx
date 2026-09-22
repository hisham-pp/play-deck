'use client';

import React from 'react';

import type { AlibiPlayer } from '../types/alibi.types';

interface Props {
  players: AlibiPlayer[];
  suspectId: string | undefined;
}

export function AlibiGameOver({ players, suspectId }: Props) {
  const suspect = players.find((p) => p.isSuspect);

  return (
    <div className="w-full max-w-lg rounded-xl border border-amber-500/40 bg-surface-raised p-6 space-y-4">
      <h2 className="text-xl font-black text-white text-center font-display">📋 Case Closed</h2>
      <p className="text-sm text-center text-deck-400">
        The suspect was:{' '}
        <span className="font-bold text-rose-400">{suspect?.displayName ?? suspectId}</span>
      </p>
      <div className="space-y-2">
        {[...players]
          .sort((a, b) => b.score - a.score)
          .map((p, i) => (
            <div
              key={p.id}
              className="flex justify-between items-center px-3 py-2 rounded-lg bg-surface-base border border-surface-border"
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-sm">#{i + 1}</span>
                <span>{p.avatar}</span>
                <span className="text-white text-sm font-semibold">{p.displayName}</span>
                {p.isSuspect && <span className="text-xs text-rose-400 font-bold">(Suspect)</span>}
              </div>
              <span className="text-amber-400 font-bold text-sm">{p.score} pts</span>
            </div>
          ))}
      </div>
    </div>
  );
}
