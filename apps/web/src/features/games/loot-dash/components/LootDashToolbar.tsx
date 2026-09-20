'use client';

import React, { useState } from 'react';
import type { LootDashConfig } from '../types/loot-dash.types';

interface LootDashToolbarProps {
  config: LootDashConfig;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReturnToLobby: () => void;
  onToggleSound: () => void;
  onToggleHighContrast: () => void;
  onToggleReducedMotion: () => void;
  onVirtualMove?: (x: number, y: number) => void;
  onDeployTrap?: () => void;
}

export function LootDashToolbar({
  config,
  isPaused,
  onPause,
  onResume,
  onRestart,
  onReturnToLobby,
  onToggleSound,
  onToggleHighContrast,
  onToggleReducedMotion,
  onVirtualMove,
  onDeployTrap,
}: LootDashToolbarProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="w-full max-w-[960px] mx-auto mt-3 flex flex-col gap-3">
      {/* Action and Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isPaused ? onResume : onPause}
            className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            🔄 Restart
          </button>

          <button
            type="button"
            onClick={onReturnToLobby}
            className="px-3 py-1.5 rounded-lg font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            ⎋ Lobby
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
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
            className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
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
            className={`px-2.5 py-1.5 rounded-lg font-medium border transition-all cursor-pointer ${
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
            className="px-2.5 py-1.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            ❓ Controls
          </button>
        </div>

        {showHelp && (
          <div className="w-full mt-2 p-3 bg-slate-950/90 rounded-lg border border-slate-700/80 text-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <strong className="text-amber-400 block mb-1">Dashing</strong>
              W / A / S / D or Arrows
              <br />
              High acceleration sprint
              <br />
              Elastic bumper rebounds
            </div>
            <div>
              <strong className="text-sky-400 block mb-1">Loot Tiers</strong>
              Bronze Coin: +5 pts
              <br />
              Silver Coin: +10 pts
              <br />
              Gold Bar: +25 pts
              <br />
              Diamond Gem: +50 pts
              <br />
              Chest: +100 pts + Powerup
            </div>
            <div>
              <strong className="text-purple-400 block mb-1">Hazards</strong>
              Spikes: Stun + drop loot
              <br />
              Slime Pool: Speed cut 65%
              <br />
              Decoy Gem: Explodes on grab
            </div>
            <div>
              <strong className="text-emerald-400 block mb-1">Power-Ups</strong>
              ⚡ Speed: +50% sprint
              <br />
              🧲 Magnet: Pulls loot
              <br />
              🛡️ Shield: Trap immunity
              <br />
              🧤 Thief: Bump to steal loot
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Touch On-Screen D-Pad and Trap Button */}
      {onVirtualMove && (
        <div className="md:hidden flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/60">
          <div className="grid grid-cols-3 gap-1 w-32 h-32">
            <div />
            <button
              type="button"
              onPointerDown={() => onVirtualMove(0, -1)}
              onPointerUp={() => onVirtualMove(0, 0)}
              className="bg-slate-800 active:bg-amber-500/30 rounded-lg text-slate-200 font-bold text-lg flex items-center justify-center border border-slate-700"
            >
              ▲
            </button>
            <div />
            <button
              type="button"
              onPointerDown={() => onVirtualMove(-1, 0)}
              onPointerUp={() => onVirtualMove(0, 0)}
              className="bg-slate-800 active:bg-amber-500/30 rounded-lg text-slate-200 font-bold text-lg flex items-center justify-center border border-slate-700"
            >
              ◀
            </button>
            <div className="bg-slate-900/50 rounded-lg" />
            <button
              type="button"
              onPointerDown={() => onVirtualMove(1, 0)}
              onPointerUp={() => onVirtualMove(0, 0)}
              className="bg-slate-800 active:bg-amber-500/30 rounded-lg text-slate-200 font-bold text-lg flex items-center justify-center border border-slate-700"
            >
              ▶
            </button>
            <div />
            <button
              type="button"
              onPointerDown={() => onVirtualMove(0, 1)}
              onPointerUp={() => onVirtualMove(0, 0)}
              className="bg-slate-800 active:bg-amber-500/30 rounded-lg text-slate-200 font-bold text-lg flex items-center justify-center border border-slate-700"
            >
              ▼
            </button>
            <div />
          </div>

          {onDeployTrap && (
            <button
              type="button"
              onClick={onDeployTrap}
              className="px-5 py-4 bg-linear-to-br from-purple-600 to-pink-600 active:from-purple-500 active:to-pink-500 text-white font-bold rounded-2xl shadow-lg border border-pink-400/50 text-sm flex flex-col items-center gap-1"
            >
              <span className="text-2xl">💎</span>
              <span>Trap</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
