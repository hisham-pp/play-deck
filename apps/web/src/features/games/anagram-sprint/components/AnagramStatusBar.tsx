'use client';

import { Timer } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, MODE_LABELS } from '../engine/anagram-constants';
import { currentRound } from '../engine/anagram-state';
import type { AnagramClock } from '../hooks/use-anagram-clock';
import type { AnagramState } from '../types/anagram-sprint.types';

export interface AnagramStatusBarProps {
  state: AnagramState;
  clock: AnagramClock;
}

const CHIP =
  'rounded-lg border border-surface-border bg-surface-raised px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-deck-600 dark:text-deck-300 font-display';

/** Under a quarter of the clock left — worth turning the bar red. */
const URGENT_PROGRESS = 0.75;

export function AnagramStatusBar({ state, clock }: AnagramStatusBarProps) {
  const round = currentRound(state);
  const isUrgent = clock.progress >= URGENT_PROGRESS;
  const roundNumber = Math.min(state.roundIndex + 1, state.rules.totalRounds);

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300 font-display">
            {MODE_LABELS[state.rules.mode]}
          </span>
          <span className={CHIP}>
            Word {roundNumber} / {state.rules.totalRounds}
          </span>
          {round && (
            <span className={cn(CHIP, 'hidden sm:inline')}>
              {CATEGORY_LABELS[round.entry.category]} · {round.entry.difficulty}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-raised px-2.5 py-1.5">
          <Timer className={cn('w-3.5 h-3.5', isUrgent ? 'text-rose-500' : 'text-amber-500')} />
          <span
            role="timer"
            aria-live="off"
            aria-label={`${clock.secondsLeft} seconds left`}
            className={cn(
              'font-mono text-sm font-bold leading-none tabular-nums',
              isUrgent ? 'text-rose-500' : 'text-deck-900 dark:text-white',
            )}
          >
            {clock.secondsLeft}s
          </span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Time left on this word"
        aria-valuemin={0}
        aria-valuemax={round?.seconds ?? 0}
        aria-valuenow={clock.secondsLeft}
        className="h-1.5 w-full rounded-full bg-surface-overlay overflow-hidden"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-100 ease-linear motion-reduce:transition-none',
            isUrgent ? 'bg-rose-500' : 'bg-amber-500',
          )}
          style={{ width: `${Math.max(0, 100 - clock.progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
