'use client';

import { Map, Mountain, RotateCcw, Skull, Zap } from 'lucide-react';
import React from 'react';

interface GameOverModalProps {
  levelNumber: number;
  levelName: string;
  altitudeMeters: number;
  xpGained: number;
  onRetry: () => void;
  onReturnToMap: () => void;
}

export function GameOverModal({
  levelNumber,
  levelName,
  altitudeMeters,
  xpGained,
  onRetry,
  onReturnToMap,
}: GameOverModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-rose-500/50 bg-gradient-to-b from-[#1a1118] to-[#0c070c] p-6 shadow-[0_0_50px_rgba(244,63,94,0.25)] text-center space-y-4">
        {/* Skull Emblem */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/20">
          <Skull className="w-8 h-8" />
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] font-mono text-rose-400 font-bold">
            Climb Halted
          </div>
          <h2 id="game-over-title" className="text-2xl font-black text-white mt-1">
            Fallen on Level {levelNumber}
          </h2>
          <p className="text-xs text-deck-400 font-medium mt-0.5">{levelName}</p>
        </div>

        {/* Milestone Summary */}
        <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-surface-border bg-slate-950/80 p-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-mono text-deck-500">
              <Mountain className="w-3 h-3 text-amber-400" />
              <span>Altitude</span>
            </div>
            <div className="font-mono text-sm font-bold text-white">{altitudeMeters}m</div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-mono text-deck-500">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>XP Preserved</span>
            </div>
            <div className="font-mono text-sm font-bold text-amber-300">+{xpGained} XP</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-amber-500/25 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Ascent [R]</span>
          </button>

          <button
            type="button"
            onClick={onReturnToMap}
            className="w-full rounded-xl border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-300 hover:text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Map className="w-4 h-4" />
            <span>Return to Map [M]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
