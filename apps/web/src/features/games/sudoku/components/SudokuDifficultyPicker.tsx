'use client';

import { Trophy } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { DIFFICULTY_CONFIG, DIFFICULTY_ORDER } from '../engine/sudoku-constants';
import type { SudokuDifficulty, SudokuStats } from '../types/sudoku.types';
import { formatBestTime } from '../utils/format-duration';

export interface SudokuDifficultyPickerProps {
  activeDifficulty: SudokuDifficulty;
  stats: SudokuStats | null;
  onPick: (difficulty: SudokuDifficulty) => void;
  /** Compact mode drops the blurb, for the in-game "new puzzle" menu. */
  compact?: boolean;
}

/** Difficulty index drawn as a rising bar chart of five notches. */
function DifficultyMeter({ level, total }: { level: number; total: number }) {
  const filled = Math.round(((level + 1) / total) * 5);

  return (
    <span aria-hidden="true" className="flex items-end gap-[3px] h-3.5">
      {[0, 1, 2, 3, 4].map((notch) => (
        <span
          key={notch}
          className={cn(
            'w-[3px] rounded-sm transition-colors',
            notch < filled ? 'bg-amber-500' : 'bg-deck-300 dark:bg-deck-700',
          )}
          style={{ height: `${40 + notch * 15}%` }}
        />
      ))}
    </span>
  );
}

export function SudokuDifficultyPicker({
  activeDifficulty,
  stats,
  onPick,
  compact = false,
}: SudokuDifficultyPickerProps) {
  return (
    <div
      role="group"
      aria-label="Choose a difficulty"
      className={cn('w-full grid gap-1.5', compact ? 'grid-cols-1' : 'sm:grid-cols-2')}
    >
      {DIFFICULTY_ORDER.map((difficulty, level) => {
        const config = DIFFICULTY_CONFIG[difficulty];
        const best = stats?.bestTimes[difficulty];
        const isActive = difficulty === activeDifficulty;

        return (
          <button
            key={difficulty}
            type="button"
            onClick={() => onPick(difficulty)}
            aria-current={isActive || undefined}
            className={cn(
              'group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.98]',
              'border-surface-border bg-surface-raised hover:border-amber-500/60 hover:bg-amber-500/5',
              isActive && 'border-amber-500/70 bg-amber-500/10',
            )}
          >
            <DifficultyMeter level={level} total={DIFFICULTY_ORDER.length} />

            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-sm text-deck-900 dark:text-white">
                  {config.label}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-deck-500 shrink-0">
                  <Trophy className="w-3 h-3 text-amber-500/80" />
                  {formatBestTime(best)}
                </span>
              </span>

              {!compact && (
                <span className="block mt-0.5 text-[11px] leading-snug text-deck-600 dark:text-deck-400">
                  {config.blurb}
                </span>
              )}

              <span className="block mt-1 text-[9px] font-mono uppercase tracking-wider text-deck-500">
                {config.targetClues} clues • {config.maxMistakes}{' '}
                {config.maxMistakes === 1 ? 'life' : 'lives'} • {config.hints}{' '}
                {config.hints === 1 ? 'hint' : 'hints'}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
