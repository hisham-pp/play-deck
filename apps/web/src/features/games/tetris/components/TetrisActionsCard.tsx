'use client';

import { Pause, Play, RotateCcw } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import type { TetrisGameStatus } from '../types/tetris.types';

export interface TetrisActionsCardProps {
  status: TetrisGameStatus;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const BTN_TYPE = 'button';
const ICON_SM = 'w-3.5 h-3.5';

export function TetrisActionsCard({
  status,
  onPause,
  onResume,
  onRestart,
}: TetrisActionsCardProps) {
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';

  return (
    <div className="w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-raised/80 border border-surface-border shadow-arcade text-xs">
      <span className="text-[10px] font-bold text-deck-400 uppercase tracking-widest font-mono">
        Actions
      </span>

      <div className="flex flex-col gap-1.5">
        {isPlaying && (
          <Button
            type={BTN_TYPE}
            onClick={onPause}
            variant="outline"
            size="sm"
            className="w-full justify-center gap-1.5 text-xs text-deck-200 hover:text-white"
          >
            <Pause className={ICON_SM} />
            <span>Pause (P)</span>
          </Button>
        )}

        {isPaused && (
          <Button
            type={BTN_TYPE}
            onClick={onResume}
            variant="primary"
            size="sm"
            className="w-full justify-center gap-1.5 text-xs font-bold"
          >
            <Play className={`${ICON_SM} fill-current`} />
            <span>Resume (P)</span>
          </Button>
        )}

        <Button
          type={BTN_TYPE}
          onClick={onRestart}
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-1.5 text-xs text-deck-400 hover:text-deck-200"
        >
          <RotateCcw className={ICON_SM} />
          <span>Restart (R)</span>
        </Button>
      </div>

      <div className="p-2 rounded-xl bg-surface-base/60 border border-surface-border/50 text-[10px] text-deck-500 text-center font-mono flex flex-col gap-0.5">
        <span>← → move • ↑ / X rotate • Z rotate back</span>
        <span>↓ soft drop • Space hard drop • C hold</span>
      </div>
    </div>
  );
}
