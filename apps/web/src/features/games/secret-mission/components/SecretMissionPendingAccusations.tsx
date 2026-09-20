'use client';

import React from 'react';

import type { Accusation } from '../types/secret-mission.types';

interface Props {
  accusations: Accusation[];
  onResolve: (idx: number, isCorrect: boolean) => void;
}

export function SecretMissionPendingAccusations({ accusations, onResolve }: Props) {
  const pending = accusations.filter((a) => !a.result);
  if (pending.length === 0) return null;

  return (
    <div className="w-full max-w-lg space-y-2">
      <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
        Pending Accusations
      </p>
      {accusations.map((acc, i) =>
        !acc.result ? (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg bg-surface-base border border-surface-border p-3"
          >
            <p className="text-sm text-deck-200">
              <span className="font-bold text-white">{acc.accuserName}</span> → {acc.suspectName}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onResolve(i, true)}
                className="px-3 py-1 text-xs rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                Caught!
              </button>
              <button
                onClick={() => onResolve(i, false)}
                className="px-3 py-1 text-xs rounded bg-surface-overlay hover:bg-surface-raised text-deck-200 font-bold"
              >
                Wrong
              </button>
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}
