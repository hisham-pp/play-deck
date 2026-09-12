'use client';

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import React from 'react';
import type { Direction, SnakeGameStatus } from '../types/snake.types';

export interface SnakeDPadProps {
  status: SnakeGameStatus;
  onDirectionChange: (dir: Direction) => void;
}

const DPAD_BTN_STYLE =
  'w-12 h-12 rounded-xl border border-surface-border bg-surface-raised active:bg-amber-500 active:text-slate-950 active:scale-95 transition-transform flex items-center justify-center text-deck-300 shadow-md focus:outline-none';

const ICON_SIZE_STYLE = 'w-5 h-5';
const BTN_TYPE = 'button';

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(12);
    } catch {
      // Ignore vibration errors
    }
  }
}

export function SnakeDPad({ status, onDirectionChange }: SnakeDPadProps) {
  const canControl = status === 'playing' || status === 'countdown';

  const handleDir = (dir: Direction, e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic();
    onDirectionChange(dir);
  };

  return (
    <div className="md:hidden flex flex-col items-center gap-1.5 touch-none select-none my-1">
      <button
        type={BTN_TYPE}
        aria-label="Move Up"
        disabled={!canControl}
        onPointerDown={(e) => handleDir('UP', e)}
        className={DPAD_BTN_STYLE}
      >
        <ArrowUp className={ICON_SIZE_STYLE} />
      </button>

      <div className="flex items-center gap-3">
        <button
          type={BTN_TYPE}
          aria-label="Move Left"
          disabled={!canControl}
          onPointerDown={(e) => handleDir('LEFT', e)}
          className={DPAD_BTN_STYLE}
        >
          <ArrowLeft className={ICON_SIZE_STYLE} />
        </button>

        <button
          type={BTN_TYPE}
          aria-label="Move Down"
          disabled={!canControl}
          onPointerDown={(e) => handleDir('DOWN', e)}
          className={DPAD_BTN_STYLE}
        >
          <ArrowDown className={ICON_SIZE_STYLE} />
        </button>

        <button
          type={BTN_TYPE}
          aria-label="Move Right"
          disabled={!canControl}
          onPointerDown={(e) => handleDir('RIGHT', e)}
          className={DPAD_BTN_STYLE}
        >
          <ArrowRight className={ICON_SIZE_STYLE} />
        </button>
      </div>
    </div>
  );
}
