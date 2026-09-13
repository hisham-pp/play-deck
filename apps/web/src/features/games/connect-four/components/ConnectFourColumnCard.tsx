'use client';

import { ArrowDown } from 'lucide-react';
import React from 'react';
import { COLS, DISC_RED, STATUS_PLAYING } from '../engine/connect-four-constants';
import { isColumnFull } from '../engine/connect-four-utils';
import type { ConnectFourCell, ConnectFourDisc } from '../types/connect-four.types';

export interface ConnectFourColumnCardProps {
  board: ConnectFourCell[];
  turn: ConnectFourDisc;
  status: string;
  disabled?: boolean;
  onDrop: (column: number) => void;
}

export function ConnectFourColumnCard({
  board,
  turn,
  status,
  disabled = false,
  onDrop,
}: ConnectFourColumnCardProps) {
  const isGameActive = status === STATUS_PLAYING && !disabled;

  return (
    <div className="w-full bg-surface-raised border border-surface-border rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider font-display text-deck-400">
          Drop Column
        </span>
        <span className="text-[10px] text-deck-500 font-mono">1–7 or Click</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 pt-1 border-t border-surface-border/50">
        {Array.from({ length: COLS }).map((_, col) => {
          const full = isColumnFull(board, col);
          const canDrop = isGameActive && !full;

          return (
            <button
              key={`card-col-${col}`}
              type="button"
              aria-label={`Drop in column ${col + 1}${full ? ' (Full)' : ''}`}
              disabled={!canDrop}
              onClick={() => onDrop(col)}
              className={`py-2 px-1 rounded-lg font-mono text-xs font-bold transition-all flex flex-col items-center gap-1 border ${
                full
                  ? 'bg-deck-900/20 border-deck-800/30 text-deck-600 opacity-40 cursor-not-allowed'
                  : canDrop
                    ? turn === DISC_RED
                      ? 'bg-rose-500/10 hover:bg-rose-500/25 active:scale-95 border-rose-500/30 text-rose-400 shadow-sm'
                      : 'bg-amber-500/10 hover:bg-amber-500/25 active:scale-95 border-amber-500/30 text-amber-400 shadow-sm'
                    : 'bg-deck-900/30 border-surface-border text-deck-500 cursor-not-allowed'
              }`}
            >
              <span>{col + 1}</span>
              <ArrowDown className="w-3 h-3 opacity-80" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
