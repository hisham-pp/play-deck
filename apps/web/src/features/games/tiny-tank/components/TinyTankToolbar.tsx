'use client';

import React, { useState } from 'react';
import type { TinyTankConfig } from '../types/tiny-tank.types';

interface TinyTankToolbarProps {
  config: TinyTankConfig;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReturnToLobby: () => void;
  onToggleSound: () => void;
  onToggleHighContrast: () => void;
  onToggleReducedMotion: () => void;
}

const BTN_TYPE = 'button' as const;
const HELP_LABEL_CLASS = 'font-bold text-amber-400';

export function TinyTankToolbar({
  config,
  isPaused,
  onPause,
  onResume,
  onRestart,
  onReturnToLobby,
  onToggleSound,
  onToggleHighContrast,
  onToggleReducedMotion,
}: TinyTankToolbarProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="w-full max-w-[960px] mx-auto mt-3 flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
      <div className="flex items-center gap-2">
        <button
          type={BTN_TYPE}
          onClick={isPaused ? onResume : onPause}
          className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>

        <button
          type={BTN_TYPE}
          onClick={onRestart}
          className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
        >
          🔄 Restart
        </button>

        <button
          type={BTN_TYPE}
          onClick={onReturnToLobby}
          className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
        >
          ⎋ Lobby
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type={BTN_TYPE}
          onClick={onToggleSound}
          className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all ${
            config.soundEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-slate-800/40 border-slate-700 text-slate-400'
          }`}
        >
          {config.soundEnabled ? '🔊 Sound' : '🔇 Muted'}
        </button>

        <button
          type={BTN_TYPE}
          onClick={onToggleHighContrast}
          className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all ${
            config.highContrast
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-slate-800/40 border-slate-700 text-slate-400'
          }`}
        >
          👁️ Contrast
        </button>

        <button
          type={BTN_TYPE}
          onClick={onToggleReducedMotion}
          className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all ${
            config.reducedMotion
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
              : 'bg-slate-800/40 border-slate-700 text-slate-400'
          }`}
        >
          ⚡ Motion
        </button>

        <button
          type={BTN_TYPE}
          onClick={() => setShowHelp(!showHelp)}
          className="px-2.5 py-1.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-all"
        >
          ❓ Help
        </button>
      </div>

      {showHelp && (
        <div className="w-full mt-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-300 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div>
            <span className={HELP_LABEL_CLASS}>Move:</span> WASD / Arrow Keys
          </div>
          <div>
            <span className={HELP_LABEL_CLASS}>Aim:</span> Mouse Cursor
          </div>
          <div>
            <span className={HELP_LABEL_CLASS}>Fire:</span> Space / Left Click
          </div>
          <div>
            <span className={HELP_LABEL_CLASS}>Weapons:</span> Keys 1-6
          </div>
        </div>
      )}
    </div>
  );
}
