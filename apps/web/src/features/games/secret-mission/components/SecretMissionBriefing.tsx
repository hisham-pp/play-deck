'use client';

import React from 'react';

import type { SecretMissionPlayer } from '../types/secret-mission.types';

interface Props {
  localPlayer: SecretMissionPlayer | undefined;
}

export function SecretMissionBriefing({ localPlayer }: Props) {
  if (!localPlayer?.mission) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-center text-sm text-amber-400">
        Awaiting mission assignment…
      </div>
    );
  }

  const { mission } = localPlayer;

  return (
    <div className="w-full max-w-lg rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🕵️</span>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Your Secret Mission
        </p>
      </div>
      <p className="text-lg font-bold text-white">{mission.title}</p>
      <p className="text-sm text-deck-300">{mission.description}</p>
      <div className="rounded-lg bg-surface-base/50 p-3">
        <p className="text-xs text-deck-400 font-semibold uppercase tracking-wider mb-1">
          Completion Criteria
        </p>
        <p className="text-sm text-deck-200">{mission.completionCriteria}</p>
      </div>
      {localPlayer.isMissionComplete && (
        <div className="text-center py-1 rounded-lg bg-emerald-600/20 border border-emerald-500/30">
          <p className="text-sm font-bold text-emerald-400">✅ Mission Declared Complete!</p>
        </div>
      )}
      {localPlayer.wasCaught && (
        <div className="text-center py-1 rounded-lg bg-rose-600/20 border border-rose-500/30">
          <p className="text-sm font-bold text-rose-400">🚨 You Were Caught!</p>
        </div>
      )}
    </div>
  );
}
