'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDownToLine,
  ArchiveRestore,
} from 'lucide-react';
import React from 'react';
import type { TetrisGameStatus } from '../types/tetris.types';

export interface TetrisDPadProps {
  status: TetrisGameStatus;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onHold: () => void;
}

const BTN_STYLE =
  'w-12 h-12 rounded-xl border border-surface-border bg-surface-raised active:bg-amber-500 active:text-slate-950 active:scale-95 transition-transform flex items-center justify-center text-deck-300 shadow-md focus:outline-none';

const WIDE_BTN_STYLE =
  'h-12 px-4 rounded-xl border border-surface-border bg-surface-raised active:bg-amber-500 active:text-slate-950 active:scale-95 transition-transform flex items-center justify-center gap-1.5 text-deck-300 shadow-md focus:outline-none text-[11px] font-bold uppercase tracking-wide';

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

export function TetrisDPad({
  status,
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onHold,
}: TetrisDPadProps) {
  const canControl = status === 'playing' || status === 'countdown';

  const withHaptic = (fn: () => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic();
    fn();
  };

  return (
    <div className="md:hidden flex flex-col items-center gap-2 touch-none select-none my-1">
      <div className="flex items-center gap-2">
        <button
          type={BTN_TYPE}
          aria-label="Hold Piece"
          disabled={!canControl}
          onPointerDown={withHaptic(onHold)}
          className={WIDE_BTN_STYLE}
        >
          <ArchiveRestore className={ICON_SIZE_STYLE} />
          <span>Hold</span>
        </button>
        <button
          type={BTN_TYPE}
          aria-label="Rotate"
          disabled={!canControl}
          onPointerDown={withHaptic(onRotateCW)}
          className={BTN_STYLE}
        >
          <ArrowUp className={ICON_SIZE_STYLE} />
        </button>
        <button
          type={BTN_TYPE}
          aria-label="Hard Drop"
          disabled={!canControl}
          onPointerDown={withHaptic(onHardDrop)}
          className={WIDE_BTN_STYLE}
        >
          <ArrowDownToLine className={ICON_SIZE_STYLE} />
          <span>Drop</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type={BTN_TYPE}
          aria-label="Move Left"
          disabled={!canControl}
          onPointerDown={withHaptic(onMoveLeft)}
          className={BTN_STYLE}
        >
          <ArrowLeft className={ICON_SIZE_STYLE} />
        </button>

        <button
          type={BTN_TYPE}
          aria-label="Soft Drop"
          disabled={!canControl}
          onPointerDown={withHaptic(onSoftDrop)}
          className={BTN_STYLE}
        >
          <ArrowDown className={ICON_SIZE_STYLE} />
        </button>

        <button
          type={BTN_TYPE}
          aria-label="Move Right"
          disabled={!canControl}
          onPointerDown={withHaptic(onMoveRight)}
          className={BTN_STYLE}
        >
          <ArrowRight className={ICON_SIZE_STYLE} />
        </button>
      </div>
    </div>
  );
}
