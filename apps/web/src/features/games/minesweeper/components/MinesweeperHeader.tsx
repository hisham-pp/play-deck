'use client';

import React from 'react';
import { STATUS_LOST, STATUS_WON } from '../engine/minesweeper-constants';
import type { MinesweeperGameStatus } from '../types/minesweeper.types';

interface MinesweeperHeaderProps {
  minesRemaining: number;
  elapsedMs: number;
  status: MinesweeperGameStatus;
  onReset: () => void;
  bestTimeMs?: number | null;
}

function formatDigitalNumber(num: number): string {
  if (num < 0) {
    const abs = Math.abs(num);
    return `-${String(abs).padStart(2, '0')}`;
  }
  return String(Math.min(999, Math.max(0, num))).padStart(3, '0');
}

export function MinesweeperHeader({
  minesRemaining,
  elapsedMs,
  status,
  onReset,
  bestTimeMs,
}: MinesweeperHeaderProps) {
  const seconds = Math.floor(elapsedMs / 1000);

  const renderFace = () => {
    if (status === STATUS_WON) return '😎';
    if (status === STATUS_LOST) return '😵';
    return '🙂';
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-deck-900 border-2 border-deck-800 rounded-t-xl select-none shadow-inner">
      {/* Mine Counter Display */}
      <div
        className="flex items-center justify-center bg-black/90 border border-deck-800/80 px-2.5 py-1 rounded min-w-[68px] shadow-inner"
        title="Mines remaining (Mines - Flags)"
      >
        <span className="font-mono text-xl md:text-2xl font-black tracking-widest text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
          {formatDigitalNumber(minesRemaining)}
        </span>
      </div>

      {/* Smiley / Reset Button */}
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={onReset}
          className="w-11 h-11 flex items-center justify-center text-2xl bg-deck-800 border-t-2 border-l-2 border-deck-600 border-b-2 border-r-2 border-deck-950 rounded-lg hover:bg-deck-750 active:translate-y-0.5 active:border-deck-800 shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
          title="Restart Game (R)"
          aria-label="Restart Game"
        >
          {renderFace()}
        </button>
        {bestTimeMs !== null && bestTimeMs !== undefined && (
          <span className="text-[10px] font-mono text-amber-400 font-semibold tracking-wider">
            BEST: {Math.floor(bestTimeMs / 1000)}s
          </span>
        )}
      </div>

      {/* Digital Timer Display */}
      <div
        className="flex items-center justify-center bg-black/90 border border-deck-800/80 px-2.5 py-1 rounded min-w-[68px] shadow-inner"
        title="Elapsed Time"
      >
        <span className="font-mono text-xl md:text-2xl font-black tracking-widest text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
          {formatDigitalNumber(seconds)}
        </span>
      </div>
    </div>
  );
}
