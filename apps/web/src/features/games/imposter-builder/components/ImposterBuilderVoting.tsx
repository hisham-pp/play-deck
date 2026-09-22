'use client';

import React from 'react';

import type { ImposterBuilderPlayer } from '../types/imposter-builder.types';

interface Props {
  players: ImposterBuilderPlayer[];
  localPlayerId: string;
  localVote: string | null;
  onVote: (suspectId: string) => void;
}

export function ImposterBuilderVoting({ players, localPlayerId, localVote, onVote }: Props) {
  const suspects = players.filter((p) => p.id !== localPlayerId);

  return (
    <div className="w-full max-w-lg space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
        🗳️ Vote for the Imposter Builder
      </p>
      {suspects.map((p) => (
        <button
          key={p.id}
          onClick={() => onVote(p.id)}
          disabled={localVote !== null}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors font-semibold text-sm ${
            localVote === p.id
              ? 'border-rose-500 bg-rose-500/20 text-rose-300'
              : 'border-surface-border bg-surface-base text-white hover:bg-surface-raised'
          } disabled:opacity-60`}
        >
          <span className="text-xl">{p.avatar}</span>
          <span>{p.displayName}</span>
          {localVote === p.id && <span className="ml-auto text-rose-400">✓ Voted</span>}
        </button>
      ))}
      {localVote && <p className="text-xs text-center text-deck-400">Waiting for all votes…</p>}
    </div>
  );
}
