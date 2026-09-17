'use client';

import { Bot, Flame, Trophy, Users } from 'lucide-react';
import React from 'react';
import type { PongState } from '../engine/pong-types';

interface PongScoreboardProps {
  state: PongState;
}

export function PongScoreboard({ state }: PongScoreboardProps) {
  const { player1, player2, config, rally, servePending, serverSide } = state;
  const isAi = config.mode === 'single-player';

  return (
    <div className="w-full bg-surface-raised/90 backdrop-blur-sm border border-surface-border rounded-xl p-3 md:p-4 shadow-arcade flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Player 1 Left */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            P1
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white">Player 1</span>
              {servePending && serverSide === 'left' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold animate-pulse">
                  SERVE
                </span>
              )}
            </div>
            <span className="text-[11px] text-deck-400 font-mono">W / S keys • Touch</span>
          </div>
        </div>

        <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          {player1.score}
        </div>
      </div>

      {/* Center Match Status & Rally */}
      <div className="flex flex-col items-center justify-center px-4 py-1.5 bg-surface-overlay/80 rounded-lg border border-surface-border/60">
        <div className="flex items-center gap-2 text-xs text-deck-400 font-medium">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="uppercase tracking-wider font-mono text-[11px]">
            First to {config.winningScore}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          {rally >= 5 && <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" />}
          <span
            className={`font-mono text-sm font-bold ${
              rally >= 10
                ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                : rally >= 5
                  ? 'text-amber-500'
                  : 'text-deck-300'
            }`}
          >
            RALLY: {rally}
          </span>
        </div>
      </div>

      {/* Player 2 / AI Right */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)] md:order-1">
          {player2.score}
        </div>

        <div className="flex items-center gap-2.5 md:order-2">
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              {servePending && serverSide === 'right' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold animate-pulse">
                  SERVE
                </span>
              )}
              <span className="text-sm font-semibold text-white">
                {isAi ? `CPU (${config.difficulty})` : 'Player 2'}
              </span>
            </div>
            <span className="text-[11px] text-deck-400 font-mono">
              {isAi ? 'Smart Bot' : '↑ / ↓ keys • Touch'}
            </span>
          </div>

          <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            {isAi ? <Bot className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </div>
  );
}
