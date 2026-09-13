'use client';

import { Grid3x3, RotateCcw, SquarePen } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { DIFFICULTY_CONFIG, DIFFICULTY_ORDER } from '../engine/sudoku-constants';
import type { SudokuState, SudokuStats } from '../types/sudoku.types';
import { formatBestTime } from '../utils/format-duration';

export interface SudokuActionsCardProps {
  state: SudokuState;
  stats: SudokuStats | null;
  onOpenLevelMenu: () => void;
  onReset: () => void;
  onAutoNotes: () => void;
}

const CARD =
  'w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-raised/80 border border-surface-border shadow-arcade';
const CARD_LABEL = 'text-[10px] font-bold text-deck-400 uppercase tracking-widest font-mono';
const ACTION_BUTTON = 'w-full justify-center gap-1.5 text-xs';
const ICON = 'w-3.5 h-3.5';

export function SudokuActionsCard({
  state,
  stats,
  onOpenLevelMenu,
  onReset,
  onAutoNotes,
}: SudokuActionsCardProps) {
  const started = state.status !== 'idle';

  return (
    <div className="w-full flex flex-col gap-3">
      <div className={CARD}>
        <span className={CARD_LABEL}>Actions</span>

        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenLevelMenu}
            className={ACTION_BUTTON}
          >
            <Grid3x3 className={ICON} />
            <span>New puzzle</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!started}
            className={`${ACTION_BUTTON} text-deck-700 dark:text-deck-200`}
          >
            <RotateCcw className={ICON} />
            <span>Reset grid (R)</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAutoNotes}
            disabled={state.status !== 'playing'}
            className={`${ACTION_BUTTON} text-deck-500 hover:text-deck-800 dark:hover:text-deck-200`}
          >
            <SquarePen className={ICON} />
            <span>Fill all notes</span>
          </Button>
        </div>
      </div>

      <div className={CARD}>
        <span className={CARD_LABEL}>Best times</span>

        <ul className="flex flex-col gap-1">
          {DIFFICULTY_ORDER.map((difficulty) => (
            <li
              key={difficulty}
              className="flex items-center justify-between gap-2 text-[11px] px-2 py-1 rounded-lg odd:bg-surface-overlay/40"
            >
              <span className="text-deck-600 dark:text-deck-400">
                {DIFFICULTY_CONFIG[difficulty].label}
              </span>
              <span className="font-mono font-bold text-deck-900 dark:text-white">
                {formatBestTime(stats?.bestTimes[difficulty])}
              </span>
            </li>
          ))}
        </ul>

        {stats && stats.gamesCompleted > 0 && (
          <p className="text-[10px] font-mono text-deck-500 text-center">
            {stats.gamesCompleted} solved of {stats.gamesPlayed} started
          </p>
        )}
      </div>
    </div>
  );
}
