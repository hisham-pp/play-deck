'use client';

import { Bomb, Flag, X } from 'lucide-react';
import React, { memo } from 'react';
import type { MinesweeperCell as CellType } from '../types/minesweeper.types';

interface MinesweeperCellProps {
  cell: CellType;
  isSelected: boolean;
  onReveal: (index: number) => void;
  onToggleFlag: (index: number) => void;
  onChord: (index: number) => void;
  onSelect: (index: number) => void;
  isFlagModeActive?: boolean;
}

const NUMBER_COLOR_CLASSES: Record<number, string> = {
  1: 'text-blue-400',
  2: 'text-emerald-400',
  3: 'text-rose-400',
  4: 'text-indigo-400',
  5: 'text-amber-500',
  6: 'text-teal-400',
  7: 'text-purple-400',
  8: 'text-zinc-300',
};

const CELL_BASE_CLASSES =
  'relative select-none flex items-center justify-center font-mono font-bold text-sm transition-colors duration-75 focus:outline-none';

function RenderSpecialCell({ cell }: { cell: CellType }) {
  if (cell.isFalseFlag) {
    return (
      <div
        className={`${CELL_BASE_CLASSES} bg-rose-950/60 border border-rose-600/50 text-rose-400`}
        title="Incorrect flag"
      >
        <Bomb className="w-4 h-4 opacity-50" />
        <X className="w-5 h-5 absolute text-rose-500 font-bold" />
      </div>
    );
  }

  if (cell.isTriggeredMine) {
    return (
      <div
        className={`${CELL_BASE_CLASSES} bg-rose-600 border border-rose-400 text-white animate-pulse shadow-lg shadow-rose-600/40`}
        title="Detonated mine"
      >
        <Bomb className="w-4 h-4 text-white" />
      </div>
    );
  }

  return (
    <div
      className={`${CELL_BASE_CLASSES} bg-deck-900 border border-deck-800 text-rose-400`}
      title="Mine"
    >
      <Bomb className="w-4 h-4" />
    </div>
  );
}

function RenderRevealedCell({
  cell,
  isSelected,
  onClick,
  onMouseDown,
  onContextMenu,
}: {
  cell: CellType;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const numClass = NUMBER_COLOR_CLASSES[cell.adjacentMines] ?? 'text-deck-400';
  const selectClass = isSelected ? 'ring-2 ring-amber-500/80 ring-inset' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      tabIndex={-1}
      className={`${CELL_BASE_CLASSES} bg-deck-950/90 border border-deck-800/40 hover:bg-deck-900/60 active:bg-deck-900 cursor-pointer ${selectClass}`}
      aria-label={`Cell at row ${cell.row + 1}, column ${cell.col + 1}, ${
        cell.adjacentMines > 0 ? `${cell.adjacentMines} neighboring mines` : 'empty'
      }`}
    >
      {cell.adjacentMines > 0 ? (
        <span className={`text-base font-extrabold ${numClass}`}>{cell.adjacentMines}</span>
      ) : null}
    </button>
  );
}

function RenderFlaggedCell({
  cell,
  isSelected,
  onClick,
  onContextMenu,
}: {
  cell: CellType;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const selectClass = isSelected ? 'ring-2 ring-amber-500 ring-inset' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      onContextMenu={onContextMenu}
      tabIndex={-1}
      className={`${CELL_BASE_CLASSES} bg-deck-800/90 border-t border-l border-deck-700 border-b border-r border-deck-950 hover:bg-deck-750 text-amber-400 shadow-sm active:translate-y-px cursor-pointer ${selectClass}`}
      aria-label={`Flagged cell at row ${cell.row + 1}, column ${cell.col + 1}`}
    >
      <Flag className="w-4 h-4 fill-amber-400 text-amber-500 drop-shadow" />
    </button>
  );
}

function isSpecialCell(cell: CellType): boolean {
  return Boolean(cell.isFalseFlag || cell.isTriggeredMine || (cell.isRevealed && cell.isMine));
}

function handleCellClickAction(
  cell: CellType,
  isFlagMode: boolean,
  onReveal: (id: number) => void,
  onToggleFlag: (id: number) => void,
  onChord: (id: number) => void,
) {
  if (cell.isRevealed) {
    if (cell.adjacentMines > 0) onChord(cell.id);
    return;
  }
  if (isFlagMode) {
    onToggleFlag(cell.id);
  } else {
    onReveal(cell.id);
  }
}

export const MinesweeperCell = memo(function MinesweeperCell({
  cell,
  isSelected,
  onReveal,
  onToggleFlag,
  onChord,
  onSelect,
  isFlagModeActive = false,
}: MinesweeperCellProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(cell.id);
    handleCellClickAction(cell, isFlagModeActive, onReveal, onToggleFlag, onChord);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(cell.id);
    if (!cell.isRevealed) onToggleFlag(cell.id);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 && cell.isRevealed && cell.adjacentMines > 0) {
      e.preventDefault();
      onChord(cell.id);
    }
  };

  if (isSpecialCell(cell)) {
    return <RenderSpecialCell cell={cell} />;
  }

  if (cell.isRevealed) {
    return (
      <RenderRevealedCell
        cell={cell}
        isSelected={isSelected}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      />
    );
  }

  if (cell.isFlagged) {
    return (
      <RenderFlaggedCell
        cell={cell}
        isSelected={isSelected}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      />
    );
  }

  const selectClass = isSelected ? 'ring-2 ring-amber-500 ring-inset z-10' : '';

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      tabIndex={-1}
      className={`${CELL_BASE_CLASSES} bg-deck-800 border-t border-l border-deck-600/80 border-b-2 border-r-2 border-deck-950 hover:bg-deck-700/90 active:bg-deck-900 active:border-deck-800 text-transparent cursor-pointer shadow-sm ${selectClass}`}
      aria-label={`Hidden cell at row ${cell.row + 1}, column ${cell.col + 1}`}
    />
  );
});
