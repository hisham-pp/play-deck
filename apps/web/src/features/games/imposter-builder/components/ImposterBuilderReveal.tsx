'use client';

import React from 'react';

import type { ImposterBuilderPlayer, ImposterBuilderPhase } from '../types/imposter-builder.types';

interface Props {
  players: ImposterBuilderPlayer[];
  isHost: boolean;
  phase: ImposterBuilderPhase;
  onStartDiscussion: () => void;
  onStartVoting: () => void;
}

export function ImposterBuilderReveal({
  players,
  isHost,
  phase,
  onStartDiscussion,
  onStartVoting,
}: Props) {
  return (
    <div className="w-full space-y-4">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-400 text-center">
        {phase === 'reveal' ? '🎨 All Builds Revealed!' : '💬 Discussion Phase'}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {players.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-surface-border bg-surface-raised p-3 space-y-2"
          >
            <p className="text-xs font-bold text-white text-center">
              {p.avatar} {p.displayName}
            </p>
            <div
              className="grid border border-surface-border rounded-lg overflow-hidden"
              style={{ gridTemplateColumns: `repeat(${p.grid[0]?.length ?? 8}, 1fr)` }}
            >
              {p.grid.map((row, ri) =>
                row.map((cell, ci) => (
                  <div
                    key={`${ri}-${ci}`}
                    className="aspect-square"
                    style={{ backgroundColor: cell.filled ? cell.color : 'transparent' }}
                  />
                )),
              )}
            </div>
          </div>
        ))}
      </div>
      {isHost && phase === 'reveal' && (
        <button
          onClick={onStartDiscussion}
          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-surface-base font-black text-sm uppercase tracking-wider transition-colors"
        >
          Discuss →
        </button>
      )}
      {isHost && phase === 'discussion' && (
        <button
          onClick={onStartVoting}
          className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider transition-colors"
        >
          Vote for Imposter →
        </button>
      )}
    </div>
  );
}
