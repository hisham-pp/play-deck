'use client';

import { Pause, Play, Timer } from 'lucide-react';
import React from 'react';
import { IconButton } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { MODE_LABELS, MODE_POINTS, VARIANT_LABELS } from '../engine/word-chain-constants';
import type { WordChainClock } from '../hooks/use-word-chain-clock';
import type { WordChainState } from '../types/word-chain.types';

export interface WordChainStatusBarProps {
  state: WordChainState;
  clock: WordChainClock;
  onPause: () => void;
  onResume: () => void;
}

const CHIP =
  'rounded-lg border border-surface-border bg-surface-raised px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-deck-600 dark:text-deck-300 font-display';

/** Under a quarter of the clock left — worth turning the bar red. */
const URGENT_PROGRESS = 0.75;

export function WordChainStatusBar({ state, clock, onPause, onResume }: WordChainStatusBarProps) {
  const isPaused = state.status === 'paused';
  const canToggle = state.status === 'playing' || isPaused;
  const isUrgent = clock.progress >= URGENT_PROGRESS;

  const roundLabel =
    state.rules.mode === MODE_POINTS
      ? `Round ${Math.min(state.round, state.rules.totalRounds)} / ${state.rules.totalRounds}`
      : `Round ${state.round}`;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300 font-display">
            {MODE_LABELS[state.rules.mode]}
          </span>
          <span className={cn(CHIP, 'hidden sm:inline')}>
            {VARIANT_LABELS[state.rules.variant]}
          </span>
          <span className={CHIP}>{roundLabel}</span>
        </div>

        <div className="flex items-center gap-2">
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

          {canToggle && (
            <IconButton
              size="sm"
              variant="outline"
              aria-label={isPaused ? 'Resume game' : 'Pause game'}
              onClick={isPaused ? onResume : onPause}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </IconButton>
          )}
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Time left this turn"
        aria-valuemin={0}
        aria-valuemax={state.turnSeconds}
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
