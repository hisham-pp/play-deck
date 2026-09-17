'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import type { PongMode } from '../engine/pong-types';

interface PongMobileControlsProps {
  mode: PongMode;
  onP1Move: (dir: 'up' | 'down', active: boolean) => void;
  onP2Move: (dir: 'up' | 'down', active: boolean) => void;
}

export function PongMobileControls({ mode, onP1Move, onP2Move }: PongMobileControlsProps) {
  return (
    <div className="w-full flex md:hidden items-center justify-between gap-4 mt-2 px-1 select-none">
      {/* Player 1 Left Controls */}
      <div className="flex flex-col items-center gap-1.5 flex-1">
        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
          P1 Control
        </span>
        <div className="flex gap-2 w-full max-w-[140px]">
          <button
            type="button"
            className="flex-1 py-3 bg-surface-raised active:bg-cyan-500/20 border border-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 active:scale-95 transition-all shadow-md cursor-pointer"
            onTouchStart={() => onP1Move('up', true)}
            onTouchEnd={() => onP1Move('up', false)}
            onMouseDown={() => onP1Move('up', true)}
            onMouseUp={() => onP1Move('up', false)}
            aria-label="P1 Move Up"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="flex-1 py-3 bg-surface-raised active:bg-cyan-500/20 border border-cyan-500/40 rounded-xl flex items-center justify-center text-cyan-400 active:scale-95 transition-all shadow-md cursor-pointer"
            onTouchStart={() => onP1Move('down', true)}
            onTouchEnd={() => onP1Move('down', false)}
            onMouseDown={() => onP1Move('down', true)}
            onMouseUp={() => onP1Move('down', false)}
            aria-label="P1 Move Down"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* If 2P Mode, show Player 2 Right Controls */}
      {mode === 'local-2p' ? (
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
            P2 Control
          </span>
          <div className="flex gap-2 w-full max-w-[140px]">
            <button
              type="button"
              className="flex-1 py-3 bg-surface-raised active:bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 active:scale-95 transition-all shadow-md cursor-pointer"
              onTouchStart={() => onP2Move('up', true)}
              onTouchEnd={() => onP2Move('up', false)}
              onMouseDown={() => onP2Move('up', true)}
              onMouseUp={() => onP2Move('up', false)}
              aria-label="P2 Move Up"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="flex-1 py-3 bg-surface-raised active:bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 active:scale-95 transition-all shadow-md cursor-pointer"
              onTouchStart={() => onP2Move('down', true)}
              onTouchEnd={() => onP2Move('down', false)}
              onMouseDown={() => onP2Move('down', true)}
              onMouseUp={() => onP2Move('down', false)}
              aria-label="P2 Move Down"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 text-center py-2 px-3 rounded-xl bg-surface-overlay/60 border border-surface-border/40">
          <span className="text-[11px] text-deck-400 leading-tight block">
            Tip: Drag directly on the court to slide paddle!
          </span>
        </div>
      )}
    </div>
  );
}
