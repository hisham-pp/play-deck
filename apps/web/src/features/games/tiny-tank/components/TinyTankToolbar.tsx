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
          type="button"
          onClick={isPaused ? onResume : onPause}
          className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
        >
          🔄 Restart
        </button>

        <button
          type="button"
          onClick={onReturnToLobby}
          className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
        >
          ⎋ Lobby
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
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
          type="button"
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
          type="button"
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
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="px-2.5 py-1.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-all"
        >
          ❓ Controls
        </button>
      </div>

      {showHelp && (
        <div className="w-full mt-2 p-3 bg-slate-950/90 rounded-lg border border-slate-700/80 text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div>
            <strong className="text-amber-400 block mb-1">Navigation</strong>
            W / Up: Accelerate
            <br />
            S / Down: Reverse
            <br />
            A/D: Steer Hull
          </div>
          <div>
            <strong className="text-sky-400 block mb-1">Weapons & Fire</strong>
            Mouse: Aim Turret
            <br />
            Left Click / Space: Fire
            <br />
            1–6 Keys: Select Arsenal
          </div>
          <div>
            <strong className="text-emerald-400 block mb-1">Terrain & Pickups</strong>
            Red Bricks: Destructible
            <br />
            Barrels: Explosive Chain
            <br />
            Crates: Ammo & Weapons
          </div>
          <div>
            <strong className="text-purple-400 block mb-1">Tactics</strong>
            Bounce shots off walls
            <br />
            Drop mines in retreat
            <br />
            Shoot explosive barrels
          </div>
        </div>
      )}
    </div>
  );
}
