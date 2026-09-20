'use client';

import React from 'react';
import type { LootDashArenaState, PowerUpType } from '../types/loot-dash.types';

interface LootDashHudProps {
  arenaState: LootDashArenaState;
  localPlayerId: string;
  isPaused: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onResume: () => void;
  onReturnToLobby: () => void;
}

const POWERUP_ICONS: Record<PowerUpType, { label: string; icon: string; color: string }> = {
  speed: { label: 'Speed Dash', icon: '⚡', color: 'text-amber-400 border-amber-500/50' },
  magnet: { label: 'Loot Magnet', icon: '🧲', color: 'text-sky-400 border-sky-500/50' },
  shield: { label: 'Trap Shield', icon: '🛡️', color: 'text-cyan-400 border-cyan-500/50' },
  thief: { label: 'Thief Gloves', icon: '🧤', color: 'text-purple-400 border-purple-500/50' },
  decoy_drop: { label: 'Decoy Trap', icon: '💎', color: 'text-pink-400 border-pink-500/50' },
};

export function LootDashHud({
  arenaState,
  localPlayerId,
  isPaused,
  soundEnabled,
  onToggleSound,
  onPause,
  onResume,
  onReturnToLobby,
}: LootDashHudProps) {
  const localPlayer = arenaState.players.find((p) => p.id === localPlayerId);
  const targetScore = arenaState.targetScore || 250;
  const currentScore = localPlayer?.score ?? 0;
  const scorePct = Math.min(100, Math.round((currentScore / targetScore) * 100));

  const minutes = Math.floor(arenaState.timeRemaining / 60);
  const seconds = Math.floor(arenaState.timeRemaining % 60);
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const sortedPlayers = [...arenaState.players].sort((a, b) => b.score - a.score);
  const localRank = sortedPlayers.findIndex((p) => p.id === localPlayerId) + 1;

  return (
    <div className="w-full max-w-[960px] mx-auto mb-3 flex flex-col gap-2 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-lg text-slate-100">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Score & Progress */}
        <div className="flex items-center gap-3 min-w-[200px] flex-1">
          <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-400">
                SCORE: {currentScore} / {targetScore}
              </span>
              <span className="text-slate-400">RANK #{localRank || 1}</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/80">
              <div
                className="h-full bg-linear-to-r from-amber-500 to-yellow-300 transition-all duration-150"
                style={{ width: `${scorePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Timer & Round Status */}
        <div className="flex flex-col items-center">
          <div className="text-2xl font-black tracking-widest text-slate-100 font-mono">
            {formattedTime}
          </div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            {arenaState.status === 'playing' ? 'DASHING' : arenaState.status}
          </div>
        </div>

        {/* Active Powerup Badge */}
        {localPlayer?.activePowerUp ? (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-slate-950/70 text-xs font-bold ${
              POWERUP_ICONS[localPlayer.activePowerUp].color
            }`}
          >
            <span className="text-base">{POWERUP_ICONS[localPlayer.activePowerUp].icon}</span>
            <span>{POWERUP_ICONS[localPlayer.activePowerUp].label}</span>
            <span className="text-slate-400 text-[10px]">
              {Math.ceil(localPlayer.powerUpTimeRemaining)}s
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/40">
            No Active Power-Up
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute' : 'Unmute'}
            aria-label={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            onClick={isPaused ? onResume : onPause}
            className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={onReturnToLobby}
            className="px-2.5 py-1 rounded-lg border border-red-500/40 bg-red-950/30 hover:bg-red-900/40 text-xs font-bold text-red-300 hover:text-red-200 transition-colors"
          >
            Lobby
          </button>
        </div>
      </div>

      {/* Mini Leaderboard ticker */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/80 overflow-x-auto text-xs">
        <span className="text-[10px] uppercase font-bold text-slate-500">Live Roster:</span>
        {sortedPlayers.map((p, idx) => (
          <div key={p.id} className="flex items-center gap-1.5 shrink-0">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: p.color }}
            />
            <span
              className={`font-semibold ${
                p.id === localPlayerId ? 'text-amber-300' : 'text-slate-300'
              }`}
            >
              #{idx + 1} {p.name}
            </span>
            <span className="text-slate-400 font-mono">({p.score})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
