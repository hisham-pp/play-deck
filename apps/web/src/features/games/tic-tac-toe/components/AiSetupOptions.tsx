'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  MARK_O,
  MARK_X,
} from '../engine/tic-tac-toe-constants';
import type { AIDifficulty, PlayerMark } from '../types/tic-tac-toe.types';

export interface AiSetupOptionsProps {
  difficulty: AIDifficulty;
  humanMark: PlayerMark;
  onDifficultyChange: (diff: AIDifficulty) => void;
  onHumanMarkChange: (mark: PlayerMark) => void;
}

const BTN_TYPE = 'button';
const DIFFICULTIES: AIDifficulty[] = [DIFFICULTY_EASY, DIFFICULTY_MEDIUM, DIFFICULTY_HARD];

export function AiSetupOptions({
  difficulty,
  humanMark,
  onDifficultyChange,
  onHumanMarkChange,
}: AiSetupOptionsProps) {
  return (
    <div className="flex flex-col gap-3 p-3.5 rounded-xl bg-surface-base/80 border border-surface-border">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-deck-400 uppercase tracking-wider font-mono">
          AI Difficulty
        </span>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              type={BTN_TYPE}
              onClick={() => onDifficultyChange(diff)}
              className={cn(
                'py-2 px-2.5 rounded-lg text-xs font-semibold capitalize transition-all border',
                difficulty === diff
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm'
                  : 'text-deck-400 border-surface-border hover:text-white hover:bg-surface-overlay',
              )}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-border/50">
        <span className="text-[11px] font-bold text-deck-400 uppercase tracking-wider font-mono">
          Play As
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type={BTN_TYPE}
            onClick={() => onHumanMarkChange(MARK_X)}
            className={cn(
              'py-2 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5',
              humanMark === MARK_X
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-sm'
                : 'text-deck-400 border-surface-border hover:text-white',
            )}
          >
            <span className="text-amber-400 font-mono font-black">X</span>
            <span>(First Turn)</span>
          </button>

          <button
            type={BTN_TYPE}
            onClick={() => onHumanMarkChange(MARK_O)}
            className={cn(
              'py-2 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center gap-1.5',
              humanMark === MARK_O
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-sm'
                : 'text-deck-400 border-surface-border hover:text-white',
            )}
          >
            <span className="text-cyan-400 font-mono font-black">O</span>
            <span>(Second Turn)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
