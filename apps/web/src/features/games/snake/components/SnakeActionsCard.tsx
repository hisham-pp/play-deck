'use client';

import { Pause, Play, RotateCcw, SlidersHorizontal } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import type { SnakeGameStatus } from '../types/snake.types';

export interface SnakeActionsCardProps {
  status: SnakeGameStatus;
  onOpenSetup: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const BTN_TYPE = 'button';
const ICON_SM = 'w-3.5 h-3.5';

export function SnakeActionsCard({
  status,
  onOpenSetup,
  onPause,
  onResume,
  onRestart,
}: SnakeActionsCardProps) {
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';

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
          <span>Config</span>
        </button>
      </div>

      <Button
        type={BTN_TYPE}
        variant="primary"
        size="sm"
        onClick={onOpenSetup}
        className="w-full gap-2 text-xs font-bold shadow-sm"
      >
        <SlidersHorizontal className={ICON_SM} />
        <span>Run Setup</span>
      </Button>

      <div className="flex flex-col gap-1.5 pt-1 border-t border-surface-border/60">
        {isPlaying && (
          <Button
            type={BTN_TYPE}
            onClick={onPause}
            variant="outline"
            size="sm"
            className="w-full justify-center gap-1.5 text-xs text-deck-200 hover:text-white"
          >
            <Pause className={ICON_SM} />
            <span>Pause (Space)</span>
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
            <span>Resume (Space)</span>
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
          <span>Restart Run (R)</span>
        </Button>
      </div>

      <div className="p-2 rounded-xl bg-surface-base/60 border border-surface-border/50 text-[10px] text-deck-500 text-center font-mono flex flex-col gap-0.5">
        <span>WASD / Arrows to steer</span>
        <span>Space to pause • R to restart</span>
      </div>
    </div>
  );
}
