'use client';

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';
import type { Direction, SnakeGameStatus } from '../types/snake.types';

interface SnakeControlsProps {
  status: SnakeGameStatus;
  onDirectionChange: (dir: Direction) => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const DPAD_BTN_STYLE =
  'w-14 h-14 rounded-xl border border-surface-border bg-surface-raised active:bg-amber-500 active:text-slate-950 active:scale-95 transition-transform flex items-center justify-center text-deck-300 shadow-md focus:outline-none';

const ICON_SIZE_STYLE = 'w-6 h-6';

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(12);
    } catch {
      // Ignore vibration errors
    }
  }
}

interface DPadBtnProps {
  label: string;
  disabled: boolean;
  onPress: (e: React.TouchEvent | React.MouseEvent) => void;
  children: React.ReactNode;
}

function DPadBtn({ label, disabled, onPress, children }: DPadBtnProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onPointerDown={onPress}
      className={DPAD_BTN_STYLE}
    >
      {children}
    </button>
  );
}

export function SnakeControls({
  status,
  onDirectionChange,
  onPause,
  onResume,
  onRestart,
}: SnakeControlsProps) {
  const isPlaying = status === 'playing';
  const isPaused = status === 'paused';
  const canControl = isPlaying || status === 'countdown';

  const handleDirTouch = (dir: Direction, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic();
    onDirectionChange(dir);
  };

  return (
    <div className="w-full flex flex-col items-center gap-5 mt-2">
      {/* Action Bar */}
      <div className="flex items-center justify-center gap-3 w-full">
        {isPlaying && (
          <Button onClick={onPause} variant="outline" size="sm" className="gap-2 text-xs">
            <Pause className="w-3.5 h-3.5" />
            <span>Pause (Space)</span>
          </Button>
        )}

        {isPaused && (
          <Button onClick={onResume} variant="primary" size="sm" className="gap-2 text-xs">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume (Space)</span>
          </Button>
        )}

        {(isPlaying || isPaused || status === 'game-over') && (
          <Button onClick={onRestart} variant="secondary" size="sm" className="gap-2 text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restart (R)</span>
          </Button>
        )}
      </div>

      {/* Mobile D-Pad */}
      <div className="md:hidden flex flex-col items-center gap-2 pb-safe touch-none select-none my-1">
        <DPadBtn label="Move Up" disabled={!canControl} onPress={(e) => handleDirTouch('UP', e)}>
          <ArrowUp className={ICON_SIZE_STYLE} />
        </DPadBtn>

        <div className="flex items-center gap-4">
          <DPadBtn
            label="Move Left"
            disabled={!canControl}
            onPress={(e) => handleDirTouch('LEFT', e)}
          >
            <ArrowLeft className={ICON_SIZE_STYLE} />
          </DPadBtn>

          <DPadBtn
            label="Move Down"
            disabled={!canControl}
            onPress={(e) => handleDirTouch('DOWN', e)}
          >
            <ArrowDown className={ICON_SIZE_STYLE} />
          </DPadBtn>

          <DPadBtn
            label="Move Right"
            disabled={!canControl}
            onPress={(e) => handleDirTouch('RIGHT', e)}
          >
            <ArrowRight className={ICON_SIZE_STYLE} />
          </DPadBtn>
        </div>
      </div>

      {/* Desktop Keyboard hint */}
      <div className="hidden md:flex items-center justify-center gap-4 text-[11px] text-deck-500 font-medium">
        <span>[W, A, S, D] or [Arrows] Move</span>
        <span>•</span>
        <span>[Space] / [P] Pause</span>
        <span>•</span>
        <span>[R] Restart</span>
      </div>
    </div>
  );
}
