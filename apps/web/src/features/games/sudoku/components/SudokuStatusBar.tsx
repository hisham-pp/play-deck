'use client';

import { Heart, Pause, Play, Timer, Trophy } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { getDifficultyConfig } from '../engine/sudoku-constants';
import type { SudokuState } from '../types/sudoku.types';
import { formatBestTime, formatDuration } from '../utils/format-duration';

export interface SudokuStatusBarProps {
  state: SudokuState;
  onPause: () => void;
  onResume: () => void;
}

const STAT_TILE =
  'flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-raised px-2.5 py-1.5';
const STAT_ICON = 'w-3.5 h-3.5 text-amber-500';
const STAT_LABEL = 'text-[9px] uppercase tracking-widest text-deck-500 font-semibold leading-none';
const STAT_VALUE = 'font-mono font-bold text-sm text-deck-900 dark:text-white leading-none';

export function SudokuStatusBar({ state, onPause, onResume }: SudokuStatusBarProps) {
  const config = getDifficultyConfig(state.difficulty);
  const mistakesLeft = Math.max(0, state.maxMistakes - state.mistakes);
  const isPaused = state.status === 'paused';
  const canToggle = state.status === 'playing' || isPaused;

  return (
    <div className="w-full flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300 font-display">
          {config.label}
        </span>
        <span className="hidden sm:inline text-[10px] font-mono text-deck-500">
          {state.puzzle.clueCount} clues
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className={STAT_TILE}>
          <Timer className={STAT_ICON} />
          <div className="flex flex-col gap-0.5">
            <span className={STAT_LABEL}>Time</span>
            <span className={STAT_VALUE} aria-label={`Elapsed ${formatDuration(state.elapsedMs)}`}>
              {formatDuration(state.elapsedMs)}
            </span>
          </div>
        </div>

        <div className={STAT_TILE}>
          <Heart
            className={cn(STAT_ICON, mistakesLeft === 0 ? 'text-rose-500' : 'text-rose-400')}
          />
          <div className="flex flex-col gap-0.5">
            <span className={STAT_LABEL}>Lives</span>
            <span
              className={cn(STAT_VALUE, mistakesLeft <= 1 && 'text-rose-500 dark:text-rose-400')}
              aria-label={`${state.mistakes} of ${state.maxMistakes} mistakes used`}
            >
              {mistakesLeft}/{state.maxMistakes}
            </span>
          </div>
        </div>

        <div className={cn(STAT_TILE, 'hidden sm:flex')}>
          <Trophy className={STAT_ICON} />
          <div className="flex flex-col gap-0.5">
            <span className={STAT_LABEL}>Best</span>
            <span className={STAT_VALUE}>{formatBestTime(state.bestTimeMs)}</span>
          </div>
        </div>

        {canToggle && (
          <button
            type="button"
            onClick={isPaused ? onResume : onPause}
            aria-label={isPaused ? 'Resume puzzle' : 'Pause puzzle'}
            className="flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-raised px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-deck-600 dark:text-deck-300 transition-colors hover:border-amber-500/60 hover:text-amber-600 dark:hover:text-amber-300 active:scale-95"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
