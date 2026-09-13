'use client';

import { LogOut, RotateCcw, RotateCw, Settings } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';

export interface ConnectFourActionsCardProps {
  onResetRound: () => void;
  onResetMatch: () => void;
  onOpenSetup: () => void;
  onLeaveRoom?: () => void;
  isMultiplayer?: boolean;
  disabled?: boolean;
}

const ICON_CLASS = 'w-3.5 h-3.5';

export function ConnectFourActionsCard({
  onResetRound,
  onResetMatch,
  onOpenSetup,
  onLeaveRoom,
  isMultiplayer = false,
  disabled = false,
}: ConnectFourActionsCardProps) {
  return (
    <div className="w-full bg-surface-raised border border-surface-border rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col gap-2.5">
      <span className="text-xs font-bold uppercase tracking-wider font-display text-deck-400">
        Game Actions
      </span>

      <div className="flex flex-col gap-2 pt-1 border-t border-surface-border/50">
        <Button
          variant="secondary"
          size="sm"
          onClick={onResetRound}
          disabled={disabled}
          className="w-full justify-center text-xs flex items-center gap-1.5"
        >
          <RotateCcw className={ICON_CLASS} />
          <span>Next Round</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onResetMatch}
          disabled={disabled}
          className="w-full justify-center text-xs text-deck-400 hover:text-white flex items-center gap-1.5"
        >
          <RotateCw className={ICON_CLASS} />
          <span>Reset Scores</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSetup}
          className="w-full justify-center text-xs border-surface-border flex items-center gap-1.5"
        >
          <Settings className={ICON_CLASS} />
          <span>Match Setup</span>
        </Button>

        {isMultiplayer && onLeaveRoom && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLeaveRoom}
            className="w-full justify-center text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-1.5 border border-rose-500/20"
          >
            <LogOut className={ICON_CLASS} />
            <span>Leave Room</span>
          </Button>
        )}
      </div>
    </div>
  );
}
