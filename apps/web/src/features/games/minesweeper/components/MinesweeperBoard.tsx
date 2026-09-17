'use client';

import React, { useRef } from 'react';
import type { MinesweeperState } from '../types/minesweeper.types';
import { MinesweeperCell } from './MinesweeperCell';

interface MinesweeperBoardProps {
  state: MinesweeperState;
  onReveal: (index: number) => void;
  onToggleFlag: (index: number) => void;
  onChord: (index: number) => void;
  onSelect: (index: number) => void;
  isFlagModeActive?: boolean;
}

export function MinesweeperBoard({
  state,
  onReveal,
  onToggleFlag,
  onChord,
  onSelect,
  isFlagModeActive = false,
}: MinesweeperBoardProps) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchHandledRef = useRef<boolean>(false);

  const handleTouchStart = (cellIndex: number) => {
    touchHandledRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      touchHandledRef.current = true;
      onToggleFlag(cellIndex);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(40);
      }
    }, 350);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Determine cell size based on number of columns
  const cellSizeClass = state.cols > 16 ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-9 sm:h-9';

  return (
    <div className="w-full flex justify-center bg-deck-950/70 p-3 sm:p-5 border-x-2 border-b-2 border-deck-800 rounded-b-xl overflow-x-auto shadow-2xl">
      <div
        className="grid gap-[2px] p-2 bg-deck-900/90 border border-deck-800/80 rounded-lg shadow-inner max-w-full"
        style={{
          gridTemplateColumns: `repeat(${state.cols}, minmax(0, 1fr))`,
        }}
        role="grid"
        aria-label="Minesweeper field"
        tabIndex={0}
      >
        {state.cells.map((cell) => (
          <div
            key={cell.id}
            className={cellSizeClass}
            onTouchStart={() => handleTouchStart(cell.id)}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => {
              if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            }}
          >
            <MinesweeperCell
              cell={cell}
              isSelected={state.selectedCellIndex === cell.id}
              onReveal={onReveal}
              onToggleFlag={onToggleFlag}
              onChord={onChord}
              onSelect={onSelect}
              isFlagModeActive={isFlagModeActive}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
