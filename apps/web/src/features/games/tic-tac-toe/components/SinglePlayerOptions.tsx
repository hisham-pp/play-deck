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

interface SinglePlayerOptionsProps {
  aiDifficulty: AIDifficulty;
  humanPlayerMark: PlayerMark;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
  onHumanMarkChange: (mark: PlayerMark) => void;
}

const BTN_TYPE = 'button';
const DIFFICULTIES: AIDifficulty[] = [DIFFICULTY_EASY, DIFFICULTY_MEDIUM, DIFFICULTY_HARD];

export function SinglePlayerOptions({
  aiDifficulty,
  humanPlayerMark,
  onDifficultyChange,
  onHumanMarkChange,
}: SinglePlayerOptionsProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-raised/80 border border-surface-border text-xs">
      {/* Difficulty row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-deck-400 uppercase tracking-wider">
          AI Difficulty
        </span>
        <div className="flex items-center gap-1">
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              type={BTN_TYPE}
              onClick={() => onDifficultyChange(diff)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all',
                aiDifficulty === diff
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                  : 'text-deck-400 hover:text-white border border-transparent hover:bg-surface-overlay',
              )}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Mark choice row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-surface-border/50">
        <span className="text-[11px] font-semibold text-deck-400 uppercase tracking-wider">
          Play As
        </span>
        <div className="flex items-center gap-1">
          <button
            type={BTN_TYPE}
            onClick={() => onHumanMarkChange(MARK_X)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all',
              humanPlayerMark === MARK_X
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'text-deck-400 hover:text-white border border-transparent',
            )}
          >
            X (First)
          </button>
          <button
            type={BTN_TYPE}
            onClick={() => onHumanMarkChange(MARK_O)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all',
              humanPlayerMark === MARK_O
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                : 'text-deck-400 hover:text-white border border-transparent',
            )}
          >
            O (Second)
          </button>
        </div>
      </div>
    </div>
  );
}
