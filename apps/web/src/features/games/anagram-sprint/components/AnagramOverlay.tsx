'use client';

import React from 'react';
import {
  STATUS_COUNTDOWN,
  STATUS_FINISHED,
  STATUS_ROUND_SUMMARY,
} from '../engine/anagram-constants';
import type { AnagramState } from '../types/anagram-sprint.types';
import { AnagramGameOver } from './AnagramGameOver';
import { AnagramRoundRecap } from './AnagramRoundRecap';

export interface AnagramOverlayProps {
  state: AnagramState;
  countdown: number;
  onPlayAgain?: () => void;
  onChangeSetup: () => void;
}

/** Everything that covers the arena: the go countdown, the recap, the result. */
export function AnagramOverlay({
  state,
  countdown,
  onPlayAgain,
  onChangeSetup,
}: AnagramOverlayProps) {
  const isCountdown = state.status === STATUS_COUNTDOWN;
  const isRecap = state.status === STATUS_ROUND_SUMMARY;
  const isFinished = state.status === STATUS_FINISHED;
  if (!isCountdown && !isRecap && !isFinished) return null;

  const recap = state.history[state.history.length - 1];

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto rounded-xl bg-surface-base/92 p-5 backdrop-blur-sm">
      {isCountdown && (
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
            {state.message}
          </span>
          <span
            aria-live="assertive"
            className="font-display text-6xl font-black leading-none text-amber-500"
          >
            {countdown > 0 ? countdown : 'Go'}
          </span>
        </div>
      )}

      {isRecap && recap && <AnagramRoundRecap state={state} recap={recap} />}

      {isFinished && (
        <AnagramGameOver state={state} onPlayAgain={onPlayAgain} onChangeSetup={onChangeSetup} />
      )}
    </div>
  );
}
