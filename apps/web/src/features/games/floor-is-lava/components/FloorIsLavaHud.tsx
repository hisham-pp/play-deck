'use client';

import { Flame, Shield, Snowflake, Users, Wind, Zap } from 'lucide-react';
import React from 'react';

import { Badge } from '@playdeck/ui';

import type { ArenaState, LavaPlayer } from '../types/floor-is-lava.types';

export interface FloorIsLavaHudProps {
  arena: ArenaState;
  localPlayer: LavaPlayer | null;
  elapsedSec: number;
  onPush: () => void;
}

export function FloorIsLavaHud({ arena, localPlayer, elapsedSec, onPush }: FloorIsLavaHudProps) {
  const alivePlayers = arena.players.filter((p) => p.isAlive);
  const totalPlayers = arena.players.length;

  const seconds = Math.floor(elapsedSec);
  const hundredths = Math.floor((elapsedSec % 1) * 100);
  const timeFormatted = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60,
  ).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;

  const pushCooldown = localPlayer?.pushCooldown ?? 0;
  const isSuper = localPlayer?.activePowerUp?.type === 'super-push';
  const hasDoubleJump = localPlayer?.hasDoubleJumpReady;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 z-10 select-none">
      {/* Top Bar: Survivors, Timer & Arena Heat */}
      <div className="flex items-center justify-between w-full">
        {/* Survivors Pill */}
        <div className="pointer-events-auto flex items-center gap-2 bg-[#1c0a0a]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#450a0a] shadow-lg">
          <Users className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Survivors:
          </span>
          <span className="font-bold text-sm text-emerald-400">
            {alivePlayers.length} / {totalPlayers}
          </span>
        </div>

        {/* Freeze Notice */}
        {arena.frozenSec > 0 && (
          <div className="flex items-center gap-1.5 bg-cyan-950/90 border border-cyan-500/50 px-3 py-1.5 rounded-xl shadow-lg animate-pulse">
            <Snowflake className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300">
              ARENA FROZEN {arena.frozenSec.toFixed(1)}s
            </span>
          </div>
        )}

        {/* Survival Stopwatch */}
        <div className="flex items-center gap-2 bg-[#1c0a0a]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[#450a0a] shadow-lg">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="font-mono text-base font-bold text-amber-400">{timeFormatted}</span>
        </div>
      </div>

      {/* Bottom Bar: Push Action & Active Power-Ups */}
      <div className="flex items-end justify-between w-full">
        {/* Push Trigger & Power-Up Pill */}
        <div className="pointer-events-auto flex items-center gap-3 bg-[#1c0a0a]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#450a0a] shadow-lg">
          <button
            onClick={onPush}
            disabled={pushCooldown > 0 || !localPlayer?.isAlive}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              pushCooldown > 0 || !localPlayer?.isAlive
                ? 'bg-slate-800 text-slate-500 border border-slate-700'
                : isSuper
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)] cursor-pointer'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
            }`}
          >
            <Zap className="w-4 h-4" />
            {isSuper ? 'SUPER PUSH' : 'PUSH'}
            {pushCooldown > 0 && (
              <span className="font-mono text-[11px]">({pushCooldown.toFixed(1)}s)</span>
            )}
          </button>

          {/* Active Power-Up Indicators */}
          {localPlayer?.activePowerUp && (
            <Badge variant="outline" className="border-amber-400/60 bg-amber-950/40 text-amber-300">
              {localPlayer.activePowerUp.type === 'platform' && <Shield className="w-3 h-3 mr-1" />}
              {localPlayer.activePowerUp.type === 'freeze' && (
                <Snowflake className="w-3 h-3 mr-1" />
              )}
              {localPlayer.activePowerUp.type === 'super-push' && <Zap className="w-3 h-3 mr-1" />}
              {localPlayer.activePowerUp.type === 'double-jump' && (
                <Wind className="w-3 h-3 mr-1" />
              )}
              {localPlayer.activePowerUp.type} ({localPlayer.activePowerUp.durationSec.toFixed(0)}s)
            </Badge>
          )}

          {hasDoubleJump && (
            <Badge variant="outline" className="border-cyan-400/60 bg-cyan-950/40 text-cyan-300">
              <Wind className="w-3 h-3 mr-1" />
              Double Jump Ready (Shift)
            </Badge>
          )}
        </div>

        {/* Players Standings Chips */}
        <div className="flex items-center gap-2 bg-[#1c0a0a]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#450a0a] shadow-lg max-w-md overflow-x-auto">
          {arena.players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs whitespace-nowrap transition-opacity ${
                p.isAlive
                  ? 'bg-[#2a1212] border-[#5a1b1b] text-slate-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-50 line-through'
              }`}
            >
              <span>{p.avatar}</span>
              <span className="font-semibold">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
