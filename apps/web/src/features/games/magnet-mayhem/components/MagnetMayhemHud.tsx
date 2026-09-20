'use client';

import React from 'react';
import type { MagnetAction, MagnetArenaState, MagnetPlayer } from '../types/magnet-mayhem.types';

export interface MagnetMayhemHudProps {
  arena: MagnetArenaState;
  localPlayer: MagnetPlayer | null;
  onTouchAction: (action: MagnetAction) => void;
}

export function MagnetMayhemHud({ arena, localPlayer, onTouchAction }: MagnetMayhemHudProps) {
  const timeLeftSec = Math.max(0, Math.ceil(arena.roundDurationSec - arena.elapsedSec));
  const sortedPlayers = [...arena.players].sort((a, b) => b.score - a.score);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Bar: Round Timer & Scores */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* Leaderboard */}
        <div className="flex flex-col gap-1.5 bg-[#090d16]/85 backdrop-blur-md border border-[#1e293b] p-2.5 rounded-xl shadow-lg max-w-[280px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Leaderboard
          </span>
          <div className="flex flex-col gap-1">
            {sortedPlayers.map((p, idx) => {
              const isMe = p.id === localPlayer?.id;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between text-xs px-2 py-0.5 rounded ${
                    isMe ? 'bg-cyan-950/60 border border-cyan-700/50' : 'bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[11px] text-slate-400 font-bold">
                      #{idx + 1}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full inline-block shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="truncate max-w-[90px] text-slate-200">
                      {p.name} {isMe ? '(You)' : ''}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 ml-2">{p.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Round Timer & Target Status */}
        <div className="flex flex-col items-center">
          <div className="bg-[#090d16]/90 backdrop-blur-md border border-cyan-800/40 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">TIME</span>
            <span
              className={`font-mono font-black text-xl ${
                timeLeftSec <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-100'
              }`}
            >
              {timeLeftSec}s
            </span>
          </div>
        </div>

        {/* Local Energy / Battery Gauge */}
        {localPlayer && (
          <div className="flex flex-col items-end bg-[#090d16]/85 backdrop-blur-md border border-[#1e293b] p-2.5 rounded-xl shadow-lg min-w-[130px]">
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Magnet Charge
              </span>
              <span className="font-mono text-xs font-bold text-cyan-400">
                {Math.round(localPlayer.energy)}%
              </span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-75 rounded-full ${
                  localPlayer.energy > 40
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    : localPlayer.energy > 20
                      ? 'bg-amber-500'
                      : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${localPlayer.energy}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {localPlayer.action === 'attract'
                ? '⚡ ATTRACTING'
                : localPlayer.action === 'repel'
                  ? '💥 REPELLING'
                  : 'READY'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Area: Controls reminder on desktop, Touch action buttons on mobile */}
      <div className="w-full flex items-end justify-between gap-4">
        {/* Desktop Controls Hint */}
        <div className="hidden sm:flex items-center gap-3 bg-[#090d16]/75 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-cyan-400">
              L-Click
            </kbd>
            <span className="text-slate-400">or</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-cyan-400">
              Space
            </kbd>
            <span>Attract</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-rose-400">
              R-Click
            </kbd>
            <span className="text-slate-400">or</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-[10px] text-rose-400">
              Shift
            </kbd>
            <span>Repel</span>
          </div>
        </div>

        {/* Mobile Touch Action Buttons (Touch Friendly) */}
        <div className="sm:hidden flex items-center justify-between w-full pointer-events-auto gap-4">
          <button
            type="button"
            className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-bold rounded-xl shadow-lg border border-cyan-400/40 text-sm tracking-wider uppercase"
            onTouchStart={() => onTouchAction('attract')}
            onTouchEnd={() => onTouchAction('idle')}
            onMouseDown={() => onTouchAction('attract')}
            onMouseUp={() => onTouchAction('idle')}
          >
            🧲 Pull
          </button>
          <button
            type="button"
            className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 active:scale-95 text-white font-bold rounded-xl shadow-lg border border-rose-400/40 text-sm tracking-wider uppercase"
            onTouchStart={() => onTouchAction('repel')}
            onTouchEnd={() => onTouchAction('idle')}
            onMouseDown={() => onTouchAction('repel')}
            onMouseUp={() => onTouchAction('idle')}
          >
            💥 Blast
          </button>
        </div>
      </div>
    </div>
  );
}
