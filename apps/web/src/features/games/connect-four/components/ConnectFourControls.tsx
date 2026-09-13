'use client';

import { ArrowDown, RotateCcw, RotateCw, Settings } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import { COLS, DISC_RED, STATUS_PLAYING } from '../engine/connect-four-constants';
import { isColumnFull } from '../engine/connect-four-utils';
import type { ConnectFourCell, ConnectFourDisc } from '../types/connect-four.types';

interface ConnectFourControlsProps {
  board: ConnectFourCell[];
  turn: ConnectFourDisc;
  status: string;
  onDrop: (column: number) => void;
  onResetRound: () => void;
  onResetMatch: () => void;
  onOpenSetup: () => void;
  disabled?: boolean;
}

const KBD_KEY_CLASS =
  'px-1.5 py-0.5 rounded bg-deck-800/40 border border-surface-border text-[10px]';

export function ConnectFourControls({
  board,
  turn,
  status,
  onDrop,
  onResetRound,
  onResetMatch,
  onOpenSetup,
  disabled = false,
}: ConnectFourControlsProps) {
  const isGameActive = status === STATUS_PLAYING && !disabled;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[560px] mx-auto">
      {/* Mobile/Touch Direct Column Selector Buttons */}
      <div className="w-full bg-surface-raised/80 border border-surface-border rounded-xl p-2.5 sm:p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-deck-500 font-display">
            Drop Column
          </span>
          <span className="text-[10px] text-deck-400 font-mono hidden sm:inline">
            Keys 1-7 or Click
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full">
          {Array.from({ length: COLS }).map((_, col) => {
            const full = isColumnFull(board, col);
            const canDrop = isGameActive && !full;

            return (
              <button
                key={`touch-col-${col}`}
                type="button"
                aria-label={`Drop piece in column ${col + 1}${full ? ' (Full)' : ''}`}
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

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 w-full px-1">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onResetRound}
            className="text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Next Round</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onResetMatch}
            className="text-xs text-deck-500 hover:text-deck-800 dark:hover:text-deck-200 flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reset Match</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSetup}
          className="text-xs flex items-center gap-1.5 border-surface-border"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Game Setup</span>
        </Button>
      </div>

      {/* Keyboard Shortcut Guidance */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-deck-500 font-mono">
        <span>
          <kbd className={KBD_KEY_CLASS}>←</kbd> <kbd className={KBD_KEY_CLASS}>→</kbd> Move
        </span>
        <span>
          <kbd className={KBD_KEY_CLASS}>Space</kbd> or <kbd className={KBD_KEY_CLASS}>↓</kbd> Drop
        </span>
        <span>
          <kbd className={KBD_KEY_CLASS}>1-7</kbd> Direct Drop
        </span>
        <span>
          <kbd className={KBD_KEY_CLASS}>R</kbd> New Round
        </span>
      </div>
    </div>
  );
}
