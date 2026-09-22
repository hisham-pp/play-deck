'use client';

import React from 'react';

import type { AlibiPlayer, AlibiPhase } from '../types/alibi.types';

interface Props {
  localPlayer: AlibiPlayer | undefined;
  phase: AlibiPhase;
  isHost: boolean;
  onStartDiscussion: () => void;
  onStartVoting: () => void;
}

export function AlibiStoryCard({
  localPlayer,
  phase,
  isHost,
  onStartDiscussion,
  onStartVoting,
}: Props) {
  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-5 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400">📋 Your Alibi</p>
        <p className="text-sm text-deck-300 leading-relaxed">
          {localPlayer?.storyVariant?.playerStory ?? 'Awaiting story assignment…'}
        </p>
        {localPlayer?.isSuspect && (
          <div className="rounded-lg bg-rose-900/20 border border-rose-500/30 p-3">
            <p className="text-xs font-bold text-rose-400 mb-1">
              ⚠️ Your story has subtle differences:
            </p>
            {localPlayer.storyVariant?.inconsistencies.map((inc, i) => (
              <p key={i} className="text-xs text-rose-300">
                • {inc}
              </p>
            ))}
          </div>
        )}
      </div>

      {isHost && phase === 'reading' && (
        <button
          onClick={onStartDiscussion}
          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-surface-base font-black text-sm uppercase tracking-wider transition-colors"
        >
          Start Discussion →
        </button>
      )}

      {isHost && phase === 'discussion' && (
        <button
          onClick={onStartVoting}
          className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider transition-colors"
        >
          Start Voting →
        </button>
      )}

      {phase === 'discussion' && !isHost && (
        <p className="text-sm text-center text-deck-400">
          Compare stories with other players on voice chat! The host will start voting when ready.
        </p>
      )}
    </div>
  );
}
