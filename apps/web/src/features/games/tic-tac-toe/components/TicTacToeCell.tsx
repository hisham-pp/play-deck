import React from 'react';
import { cn } from '@/lib/utils';
import type { BoardCell } from '../types/tic-tac-toe.types';

interface TicTacToeCellProps {
  index: number;
  value: BoardCell;
  isWinningCell: boolean;
  isFocused: boolean;
  disabled: boolean;
  onClick: () => void;
  onFocus: () => void;
}

export function TicTacToeCell({
  index,
  value,
  isWinningCell,
  isFocused,
  disabled,
  onClick,
  onFocus,
}: TicTacToeCellProps) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const hotkeyNumber = index + 1;

  return (
    <button
      type="button"
      role="gridcell"
      disabled={disabled || value !== null}
      onClick={onClick}
      onFocus={onFocus}
      aria-label={`Cell ${hotkeyNumber}: Row ${row}, Column ${col}${
        value ? `, ${value}` : ', empty'
      }`}
      tabIndex={isFocused ? 0 : -1}
      className={cn(
        'relative aspect-square w-full rounded-xl md:rounded-2xl border flex items-center justify-center select-none font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl transition-all duration-150 touch-manipulation',
        // Default base style
        'bg-surface-base/80 border-surface-border text-deck-100',
        // Hover and interactive states when empty and playable
        !value &&
          !disabled && [
            'hover:bg-surface-raised hover:border-amber-500/40 hover:scale-[1.02] active:scale-[0.97]',
            'cursor-pointer',
          ],
        // Focus state for keyboard accessibility
        isFocused && 'ring-2 ring-amber-500 ring-offset-2 ring-offset-surface-base outline-none',
        // Winning animation
        isWinningCell && [
          value === 'X'
            ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.35)] animate-pulse'
            : 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.35)] animate-pulse',
        ],
        // Disabled state
        disabled && !value && 'opacity-60 cursor-not-allowed',
      )}
    >
      {/* Hotkey hint (subtle watermark) */}
      <span className="absolute top-2 left-2.5 text-[10px] sm:text-xs font-mono font-medium text-deck-600/60 pointer-events-none">
        {hotkeyNumber}
      </span>

      {/* Mark Presentation */}
      {value === 'X' && (
        <span className="text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.5)] transition-transform duration-200 scale-100">
          X
        </span>
      )}
      {value === 'O' && (
        <span className="text-cyan-400 drop-shadow-[0_0_14px_rgba(6,182,212,0.5)] transition-transform duration-200 scale-100">
          O
        </span>
      )}
    </button>
  );
}
