'use client';

import React from 'react';

import type { SecretMissionPlayer } from '../types/secret-mission.types';

interface Props {
  players: SecretMissionPlayer[];
}

export function SecretMissionGameOverModal({ players }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-surface-raised p-6 space-y-5 shadow-2xl">
        <div className="text-center">
          <p className="text-4xl mb-2">🕵️</p>
          <h2 className="text-2xl font-black text-white font-display">Mission Debrief</h2>
          {winner && (
            <p className="text-sm text-amber-400 mt-1">
              Top Agent: <span className="font-bold">{winner.displayName}</span>
            </p>
          )}
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-2 rounded-lg bg-surface-base border border-surface-border"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-amber-400">#{i + 1}</span>
                <span className="text-base">{p.avatar}</span>
                <span className="text-sm font-semibold text-white">{p.displayName}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-400">{p.score} pts</p>
                {p.isMissionComplete && !p.wasCaught && (
                  <p className="text-xs text-emerald-400">Mission Success!</p>
                )}
                {p.wasCaught && <p className="text-xs text-rose-400">Caught!</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
