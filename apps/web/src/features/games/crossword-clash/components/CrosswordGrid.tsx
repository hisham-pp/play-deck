'use client';

import React from 'react';

import type { CrosswordCell, CrosswordDirection } from '../engine/crossword-clash-engine';

interface CrosswordGridProps {
  cells: CrosswordCell[][];
  selectedRow: number;
  selectedCol: number;
  selectedDirection: CrosswordDirection;
  selectedClueId: string;
  highContrast: boolean;
  largeText: boolean;
  onSelectCell: (row: number, col: number) => void;
}

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  cells,
  selectedRow,
  selectedCol,
  selectedDirection,
  selectedClueId,
  highContrast,
  largeText,
  onSelectCell,
}) => {
  const cols = cells[0]?.length ?? 0;

  // Compute dynamic cell dimension based on grid density
  const cellSizeClass =
    cols <= 4
      ? 'w-16 h-16 sm:w-20 sm:h-20'
      : cols <= 5
        ? 'w-14 h-14 sm:w-16 sm:h-16'
        : 'w-11 h-11 sm:w-12 sm:h-12';

  const letterSizeClass = largeText
    ? cols <= 4
      ? 'text-3xl sm:text-4xl'
      : 'text-2xl sm:text-3xl'
    : cols <= 4
      ? 'text-2xl sm:text-3xl'
      : 'text-xl sm:text-2xl';

  return (
    <div
      role="grid"
      aria-label="Crossword puzzle grid"
      className={`inline-block select-none rounded-xl p-2 sm:p-3 border shadow-2xl transition-colors ${
        highContrast
          ? 'bg-black border-white'
          : 'bg-slate-900/90 border-slate-700/60 shadow-amber-500/5'
      }`}
    >
      <div
        className="grid gap-1 sm:gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((rowCells, r) =>
          rowCells.map((cell, c) => {
            if (cell.isBlack) {
              return (
                <div
                  key={`cell-${r}-${c}`}
                  role="gridcell"
                  aria-hidden="true"
                  className={`${cellSizeClass} rounded-lg bg-slate-950 border border-slate-900 shadow-inner`}
                />
              );
            }

            const isSelectedCell = r === selectedRow && c === selectedCol;
            const isInActiveClue =
              Boolean(selectedClueId) &&
              ((selectedDirection === 'across' && cell.acrossClueId === selectedClueId) ||
                (selectedDirection === 'down' && cell.downClueId === selectedClueId));

            const isLocked = Boolean(cell.lockedChar);
            const displayChar = cell.lockedChar || cell.userChar || '';

            return (
              <button
                key={`cell-${r}-${c}`}
                type="button"
                role="gridcell"
                aria-label={`Row ${r + 1}, Column ${c + 1}${
                  cell.number ? `, Clue ${cell.number}` : ''
                }${displayChar ? `, Letter ${displayChar}` : ', Empty'}`}
                tabIndex={isSelectedCell ? 0 : -1}
                onClick={() => onSelectCell(r, c)}
                className={`relative flex items-center justify-center font-bold tracking-wider rounded-lg border transition-all duration-150 ${cellSizeClass} ${letterSizeClass} ${
                  isSelectedCell
                    ? highContrast
                      ? 'bg-yellow-300 text-black border-yellow-400 ring-4 ring-yellow-400 z-20 scale-105'
                      : 'bg-amber-400/25 border-amber-400 ring-2 ring-amber-400 text-amber-200 z-20 scale-105'
                    : isInActiveClue
                      ? highContrast
                        ? 'bg-zinc-800 text-white border-zinc-500'
                        : 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                      : highContrast
                        ? 'bg-zinc-900 text-white border-zinc-700 hover:border-zinc-500'
                        : 'bg-slate-800/80 text-slate-200 border-slate-700/80 hover:bg-slate-700/80'
                } ${
                  cell.isError
                    ? 'border-red-500 ring-2 ring-red-500 bg-red-950/40 animate-pulse text-red-400'
                    : ''
                }`}
              >
                {/* Clue Number Indicator in top-left */}
                {cell.number !== undefined && (
                  <span
                    className={`absolute top-0.5 left-1 text-[9px] sm:text-[11px] font-semibold leading-none pointer-events-none ${
                      isSelectedCell
                        ? highContrast
                          ? 'text-black'
                          : 'text-amber-400'
                        : highContrast
                          ? 'text-zinc-400'
                          : 'text-slate-400'
                    }`}
                  >
                    {cell.number}
                  </span>
                )}

                {/* Letter Content */}
                <span
                  className={`pointer-events-none transform transition-transform ${
                    isLocked ? 'scale-100 font-black' : 'scale-95 font-medium italic opacity-75'
                  }`}
                  style={{
                    color:
                      isLocked && cell.lockedColor && !highContrast ? cell.lockedColor : undefined,
                  }}
                >
                  {displayChar}
                </span>

                {/* Locked indicator stripe for solver */}
                {isLocked && cell.lockedColor && (
                  <div
                    className="absolute bottom-1 left-2 right-2 h-1 rounded-full pointer-events-none opacity-85"
                    style={{ backgroundColor: cell.lockedColor }}
                  />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
};
