import React from 'react';
import type { BoardCell, WinningLine } from '../types/tic-tac-toe.types';
import { TicTacToeCell } from './TicTacToeCell';

interface TicTacToeBoardProps {
  board: BoardCell[];
  winningLine: WinningLine | null;
  focusedIndex: number;
  disabled: boolean;
  onCellClick: (index: number) => void;
  onCellFocus: (index: number) => void;
}

export function TicTacToeBoard({
  board,
  winningLine,
  focusedIndex,
  disabled,
  onCellClick,
  onCellFocus,
}: TicTacToeBoardProps) {
  return (
    <div
      role="grid"
      aria-label="3x3 Tic-Tac-Toe Game Board"
      className="relative grid grid-cols-3 gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-surface-raised/90 border border-surface-border shadow-arcade w-full max-w-[min(100%,_380px)] sm:max-w-[420px] aspect-square mx-auto"
    >
      {board.map((cellValue, idx) => {
        const isWinningCell = winningLine ? winningLine.includes(idx) : false;
        const isFocused = focusedIndex === idx;

        return (
          <TicTacToeCell
            key={idx}
            index={idx}
            value={cellValue}
            isWinningCell={isWinningCell}
            isFocused={isFocused}
            disabled={disabled}
            onClick={() => onCellClick(idx)}
            onFocus={() => onCellFocus(idx)}
          />
        );
      })}
    </div>
  );
}
