'use client';

import { Ban, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import {
  COLS,
  DISC_RED,
  DISC_YELLOW,
  ROWS,
  STATUS_PLAYING,
} from '../engine/connect-four-constants';
import { isColumnFull, toIndex } from '../engine/connect-four-utils';
import type { ConnectFourCell, ConnectFourDisc } from '../types/connect-four.types';

function formatCellLabel(
  row: number,
  col: number,
  cell: ConnectFourCell,
  isWinningCell: boolean,
): string {
  let label = `Row ${row + 1}, Column ${col + 1}: `;
  if (cell === DISC_RED) {
    label += 'Player 1 Red';
  } else if (cell === DISC_YELLOW) {
    label += 'Player 2 Yellow';
  } else {
    label += 'Empty';
  }
  if (isWinningCell) {
    label += ' (Winning Line)';
  }
  return label;
}

interface IndicatorSlotProps {
  col: number;
  turn: ConnectFourDisc;
  isGameActive: boolean;
  isTarget: boolean;
  isFull: boolean;
}

function IndicatorSlot({ isTarget, isFull, turn }: IndicatorSlotProps) {
  if (!isTarget) {
    return (
      <div className="flex flex-col items-center justify-center h-8 sm:h-10">
        <div className="w-1.5 h-1.5 rounded-full bg-deck-700/40" />
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="flex flex-col items-center justify-center h-8 sm:h-10 animate-bounce text-red-400">
        <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
    );
  }

  const isRed = turn === DISC_RED;
  return (
    <div className="flex flex-col items-center justify-center h-8 sm:h-10 animate-bounce">
      <div
        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full shadow-lg border-2 flex items-center justify-center ${
          isRed
            ? 'bg-rose-500/70 border-rose-400 text-white shadow-rose-500/40'
            : 'bg-amber-400/70 border-amber-300 text-deck-950 shadow-amber-400/40'
        }`}
      >
        <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
      </div>
    </div>
  );
}

interface CellPieceProps {
  cell: ConnectFourDisc;
  isWinningCell: boolean;
  isLatest: boolean;
}

function CellPiece({ cell, isWinningCell, isLatest }: CellPieceProps) {
  const isRed = cell === DISC_RED;
  const animClass = isLatest ? 'c4-piece-drop' : '';
  const winClass = isWinningCell
    ? 'ring-4 ring-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.9)] animate-pulse scale-105 z-10'
    : '';
  const colorClass = isRed
    ? 'bg-gradient-to-br from-rose-400 via-rose-600 to-red-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_10px_rgba(225,29,72,0.4)] border border-rose-300/40'
    : 'bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_10px_rgba(217,119,6,0.4)] border border-amber-200/50';

  return (
    <div
      className={`w-[84%] h-[84%] rounded-full relative flex items-center justify-center transition-transform ${animClass} ${winClass} ${colorClass}`}
    >
      {isRed ? (
        <div className="w-[45%] h-[45%] rounded-full border-2 border-rose-200/70 shadow-inner flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-100" />
        </div>
      ) : (
        <div className="w-[45%] h-[45%] flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-sm rotate-45 bg-amber-900/30 border border-amber-950/40 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-amber-950/60" />
          </div>
        </div>
      )}
    </div>
  );
}

interface CellButtonProps {
  row: number;
  col: number;
  cell: ConnectFourCell;
  isWinningCell: boolean;
  isLatest: boolean;
  isGameActive: boolean;
  columnFull: boolean;
  isHoveredCol: boolean;
  onDrop: (col: number) => void;
  onHover: (col: number | null) => void;
}

function CellButton({
  row,
  col,
  cell,
  isWinningCell,
  isLatest,
  isGameActive,
  columnFull,
  isHoveredCol,
  onDrop,
  onHover,
}: CellButtonProps) {
  const canClick = isGameActive && !columnFull;
  const label = formatCellLabel(row, col, cell, isWinningCell);

  return (
    <button
      type="button"
      role="gridcell"
      aria-label={label}
      aria-selected={isWinningCell}
      disabled={!canClick}
      onClick={() => canClick && onDrop(col)}
      onMouseEnter={() => onHover(col)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(col)}
      tabIndex={row === 0 ? 0 : -1}
      className={`relative aspect-square rounded-full p-0 flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
        !canClick ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.03]'
      } ${
        isHoveredCol && !cell && !columnFull
          ? 'bg-blue-900/40 ring-1 ring-blue-400/40'
          : 'bg-deck-950/90 dark:bg-[#070b14]'
      } shadow-[inset_0_4px_8px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.05)] border border-blue-800/40`}
    >
      {cell && <CellPiece cell={cell} isWinningCell={isWinningCell} isLatest={isLatest} />}
    </button>
  );
}

interface ConnectFourBoardProps {
  board: ConnectFourCell[];
  turn: ConnectFourDisc;
  status: string;
  winningCells: number[] | null;
  lastMove: { column: number; row: number } | null;
  focusedColumn: number;
  onDrop: (column: number) => void;
  onColumnFocus?: (column: number) => void;
  disabled?: boolean;
}

export function ConnectFourBoard({
  board,
  turn,
  status,
  winningCells,
  lastMove,
  focusedColumn,
  onDrop,
  onColumnFocus,
  disabled = false,
}: ConnectFourBoardProps) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

  const activeColumn = hoveredColumn !== null ? hoveredColumn : focusedColumn;
  const isGameActive = status === STATUS_PLAYING && !disabled;

  const handleHover = (col: number | null) => {
    setHoveredColumn(col);
    if (col !== null) onColumnFocus?.(col);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[560px] mx-auto select-none">
      {/* Column Drop Indicator Bar */}
      <div
        className="grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full mb-2 px-2 sm:px-4"
        aria-hidden="true"
      >
        {Array.from({ length: COLS }).map((_, col) => (
          <IndicatorSlot
            key={`indicator-${col}`}
            col={col}
            turn={turn}
            isGameActive={isGameActive}
            isTarget={isGameActive && activeColumn === col}
            isFull={isColumnFull(board, col)}
          />
        ))}
      </div>

      {/* Main Board Grid Chassis */}
      <div
        role="grid"
        aria-label="Connect Four 7 by 6 game board"
        className="w-full rounded-2xl p-2.5 sm:p-4 bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 border-2 border-blue-500/30 shadow-arcade dark:shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-md"
      >
        <div className="grid grid-rows-6 gap-2 sm:gap-3 w-full">
          {Array.from({ length: ROWS }).map((_, row) => (
            <div key={`row-${row}`} role="row" className="grid grid-cols-7 gap-2 sm:gap-3 w-full">
              {Array.from({ length: COLS }).map((_, col) => {
                const cellIndex = toIndex(row, col);
                return (
                  <CellButton
                    key={`cell-${row}-${col}`}
                    row={row}
                    col={col}
                    cell={board[cellIndex]}
                    isWinningCell={winningCells?.includes(cellIndex) ?? false}
                    isLatest={lastMove?.column === col && lastMove?.row === row}
                    isGameActive={isGameActive}
                    columnFull={isColumnFull(board, col)}
                    isHoveredCol={isGameActive && activeColumn === col}
                    onDrop={onDrop}
                    onHover={handleHover}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
