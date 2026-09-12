'use client';

import { LogOut, RotateCcw, SlidersHorizontal, Trophy } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { MODE_MULTIPLAYER } from '../engine/tic-tac-toe-constants';
import type { GameMode } from '../types/tic-tac-toe.types';

export interface TicTacToeActionsCardProps {
  mode: GameMode;
  roomCode?: string | null;
  onOpenSetup: () => void;
  onResetRound: () => void;
  onResetMatch: () => void;
  onLeaveRoom?: () => void;
}

const BTN_TYPE = 'button';
const ICON_CLASS = 'w-3.5 h-3.5';

export function TicTacToeActionsCard({
  mode,
  roomCode,
  onOpenSetup,
  onResetRound,
  onResetMatch,
  onLeaveRoom,
}: TicTacToeActionsCardProps) {
  const isMultiplayer = mode === MODE_MULTIPLAYER && Boolean(roomCode);

  return (
    <div className="w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-raised/80 border border-surface-border shadow-arcade text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-deck-400 uppercase tracking-widest font-mono">
          Actions
        </span>
        <button
          type={BTN_TYPE}
          onClick={onOpenSetup}
          className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Change</span>
        </button>
      </div>

      <Button
        type={BTN_TYPE}
        variant="primary"
        size="sm"
        onClick={onOpenSetup}
        className="w-full gap-2 text-xs font-bold shadow-sm"
      >
        <SlidersHorizontal className={ICON_CLASS} />
        <span>Match Setup</span>
      </Button>

      <div className="flex flex-col gap-1.5 pt-1 border-t border-surface-border/60">
        <Button
          type={BTN_TYPE}
          variant="outline"
          size="sm"
          onClick={onResetRound}
          className="w-full justify-center gap-1.5 text-xs text-deck-300 hover:text-white"
        >
          <RotateCcw className={ICON_CLASS} />
          <span>Restart Round (R)</span>
        </Button>

        <Button
          type={BTN_TYPE}
          variant="ghost"
          size="sm"
          onClick={onResetMatch}
          className="w-full justify-center gap-1.5 text-xs text-deck-500 hover:text-deck-300"
        >
          <Trophy className={ICON_CLASS} />
          <span>Reset Match</span>
        </Button>

        {isMultiplayer && onLeaveRoom && (
          <Button
            type={BTN_TYPE}
            variant="ghost"
            size="sm"
            onClick={onLeaveRoom}
            className="w-full justify-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            <LogOut className={ICON_CLASS} />
            <span>Leave Room</span>
          </Button>
        )}
      </div>

      <div className="p-2 rounded-xl bg-surface-base/60 border border-surface-border/50 text-[10px] text-deck-500 text-center font-mono">
        Keys 1-9 to move • R to restart
      </div>
    </div>
  );
}
