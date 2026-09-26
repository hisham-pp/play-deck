'use client';

import { Play, RotateCcw, Trophy } from 'lucide-react';
import React from 'react';
import type { PongState } from '../engine/pong-types';

interface PongOverlayProps {
  state: PongState;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
  isOnline?: boolean;
  hasOpponent?: boolean;
  roomCode?: string | null;
  role?: 'host' | 'guest' | null;
  p1Name?: string;
  p2Name?: string;
}

export function PongOverlay({
  state,
  onStart,
  onResume,
  onRestart,
  isOnline = false,
  hasOpponent = false,
  roomCode,
  role,
  p1Name,
  p2Name,
}: PongOverlayProps) {
  const { status, winner, player1, player2, highestRallyInGame, config } = state;

  if (status === 'playing') {
    return null;
  }

  const isGuest = isOnline && role === 'guest';
  const waitingForOpponent = isOnline && !hasOpponent;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-sm rounded-2xl p-6 select-none transition-all">
      {status === 'ready' && (
        <div className="flex flex-col items-center gap-5 text-center max-w-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Play className="w-7 h-7 ml-0.5" />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-white font-display">
              {waitingForOpponent ? 'WAITING FOR OPPONENT' : 'READY FOR PONG?'}
            </h2>
            <p className="text-xs text-deck-400 mt-1.5 leading-relaxed">
              {isOnline
                ? waitingForOpponent
                  ? `Share room code ${roomCode ?? ''} with a friend to begin!`
                  : `Challenger connected! ${role === 'host' ? 'Press Start Match to begin.' : 'Waiting for host to start match.'}`
                : config.mode === 'single-player'
                  ? `Challenge the AI (${config.difficulty}) in classic high-speed rally combat.`
                  : 'Two players on one device! P1 controls with W/S, P2 with Arrow keys.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-surface-raised border border-cyan-500/30 text-left">
              <span className="text-[10px] text-cyan-400 font-bold block">
                {isOnline ? `${p1Name || 'Host'} (Left)` : 'P1 CONTROLS'}
              </span>
              <span className="text-white font-semibold">
                {isGuest ? 'Remote Host' : 'W / S or Touch Left'}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-raised border border-amber-500/30 text-left">
              <span className="text-[10px] text-amber-400 font-bold block">
                {isOnline
                  ? `${p2Name || 'Challenger'} (Right)`
                  : config.mode === 'single-player'
                    ? 'OPPONENT'
                    : 'P2 CONTROLS'}
              </span>
              <span className="text-white font-semibold">
                {isOnline
                  ? isGuest
                    ? '↑ / ↓ or Touch Right'
                    : 'Remote Challenger'
                  : config.mode === 'single-player'
                    ? 'Smart CPU'
                    : '↑ / ↓ or Touch Right'}
              </span>
            </div>
          </div>

          {waitingForOpponent ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Room Code: {roomCode} • Waiting for player…</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onStart}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-deck-950 font-bold text-sm tracking-wide shadow-arcade active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isGuest ? 'READY TO PLAY' : 'START MATCH (SPACE)'}</span>
            </button>
          )}
        </div>
      )}

      {status === 'paused' && (
        <div className="flex flex-col items-center gap-4 text-center max-w-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="w-12 h-12 rounded-xl bg-deck-800 border border-deck-700 flex items-center justify-center text-deck-300">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-5 rounded-full bg-amber-400" />
              <span className="w-1.5 h-5 rounded-full bg-amber-400" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold tracking-tight text-white font-display">
              MATCH PAUSED
            </h3>
            <p className="text-xs text-deck-400 mt-1">Press Space or click Resume to continue</p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-deck-950 font-bold text-xs tracking-wider shadow-arcade active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RESUME MATCH</span>
            </button>

            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-raised hover:bg-surface-overlay text-deck-300 hover:text-white border border-surface-border font-medium text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESTART MATCH</span>
            </button>
          </div>
        </div>
      )}

      {status === 'game-over' && (
        <div className="flex flex-col items-center gap-4 text-center max-w-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.3)]">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
              FINAL SCORE {player1.score} - {player2.score}
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white font-display mt-0.5">
              {isOnline
                ? winner === 'left'
                  ? `${p1Name || 'Host'} WINS!`
                  : `${p2Name || 'Challenger'} WINS!`
                : winner === 'left'
                  ? 'PLAYER 1 WINS!'
                  : config.mode === 'single-player'
                    ? 'AI BOT WINS!'
                    : 'PLAYER 2 WINS!'}
            </h2>
            <p className="text-xs text-deck-400 mt-1">
              Longest rally reached:{' '}
              <span className="text-amber-400 font-mono font-bold">{highestRallyInGame}</span> hits
            </p>
          </div>

          <div className="w-full pt-2">
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-deck-950 font-bold text-sm tracking-wide shadow-arcade active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
