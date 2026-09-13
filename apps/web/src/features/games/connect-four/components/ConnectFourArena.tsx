'use client';

import { Bot, Trophy, Users } from 'lucide-react';
import React from 'react';
import { Avatar, Badge } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import {
  AI_DEFAULT_NAME,
  DISC_RED,
  DISC_YELLOW,
  MODE_SINGLE,
  PLAYER_1_DEFAULT_NAME,
  PLAYER_2_DEFAULT_NAME,
  STATUS_DRAW,
  STATUS_PLAYING,
  STATUS_WON,
} from '../engine/connect-four-constants';
import type { ConnectFourDisc, ConnectFourState } from '../types/connect-four.types';
import { ConnectFourBoard } from './ConnectFourBoard';
import { ConnectFourControls } from './ConnectFourControls';

interface ConnectFourArenaProps {
  state: ConnectFourState;
  focusedColumn: number;
  onDrop: (column: number, player?: ConnectFourDisc) => void;
  onColumnFocus: (column: number) => void;
  onResetRound: () => void;
  onResetMatch: () => void;
  onOpenSetup: () => void;
}

export function ConnectFourArena({
  state,
  focusedColumn,
  onDrop,
  onColumnFocus,
  onResetRound,
  onResetMatch,
  onOpenSetup,
}: ConnectFourArenaProps) {
  const { player } = usePlayerStore();

  const isSingle = state.mode === MODE_SINGLE;
  const isP1Turn = state.turn === DISC_RED;
  const isP2Turn = state.turn === DISC_YELLOW;

  const p1Name = player?.displayName || PLAYER_1_DEFAULT_NAME;
  const p2Name = isSingle
    ? `${AI_DEFAULT_NAME} (${state.aiDifficulty.toUpperCase()})`
    : PLAYER_2_DEFAULT_NAME;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-2xl mx-auto">
      {/* Top Match Bar / Player Cards */}
      <div className="w-full bg-surface-raised border border-surface-border rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3 px-1 border-b border-surface-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              size="sm"
              className="font-mono text-[10px] tracking-wider uppercase"
            >
              Round {state.round}
            </Badge>
            <Badge
              variant={isSingle ? 'arcade' : 'default'}
              size="sm"
              className="text-[10px] font-semibold"
            >
              {isSingle ? (
                <span className="flex items-center gap-1">
                  <Bot className="w-3 h-3" /> VS AI
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> Local 2P
                </span>
              )}
            </Badge>
          </div>

          <div className="text-[11px] font-mono font-medium text-deck-400">
            Ties: <span className="text-white font-bold">{state.scores.ties}</span>
          </div>
        </div>

        {/* Player Racks */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Player 1 Card (Red) */}
          <div
            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
              state.status === STATUS_PLAYING && isP1Turn
                ? 'bg-rose-500/10 border-rose-500/50 ring-1 ring-rose-500/30 shadow-sm'
                : 'bg-surface-base/60 border-surface-border/60 opacity-80'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="relative">
                <Avatar
                  src={player?.avatar}
                  size="sm"
                  fallback={p1Name[0] || '1'}
                  className="border border-rose-400/40"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-white dark:border-deck-950" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate text-deck-900 dark:text-white">
                  {p1Name}
                </span>
                <span className="text-[10px] text-rose-400 font-medium">Red Discs</span>
              </div>
            </div>

            <div className="font-mono text-xl sm:text-2xl font-black text-rose-400 pl-2">
              {state.scores.R}
            </div>
          </div>

          {/* Player 2 Card (Yellow / AI) */}
          <div
            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
              state.status === STATUS_PLAYING && isP2Turn
                ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30 shadow-sm'
                : 'bg-surface-base/60 border-surface-border/60 opacity-80'
            }`}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="relative">
                <Avatar
                  size="sm"
                  fallback={isSingle ? 'AI' : '2'}
                  className="border border-amber-400/40 bg-deck-800 text-amber-300 font-bold"
                />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border border-white dark:border-deck-950" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold truncate text-deck-900 dark:text-white">
                  {p2Name}
                </span>
                <span className="text-[10px] text-amber-400 font-medium">Yellow Discs</span>
              </div>
            </div>

            <div className="font-mono text-xl sm:text-2xl font-black text-amber-400 pl-2">
              {state.scores.Y}
            </div>
          </div>
        </div>
      </div>

      {/* Turn Status Alert Banner */}
      <div className="w-full flex items-center justify-center">
        {state.status === STATUS_PLAYING && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-raised border border-surface-border shadow-sm text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isP1Turn ? 'bg-rose-500 animate-ping' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span className="font-semibold text-deck-800 dark:text-deck-200 font-display tracking-wide">
              {state.isAiThinking
                ? 'Deck AI is calculating move...'
                : isP1Turn
                  ? `${p1Name}'s Turn`
                  : `${p2Name}'s Turn`}
            </span>
          </div>
        )}

        {state.status === STATUS_WON && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 shadow-md text-amber-400 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>
              Connect Four! {state.winner === DISC_RED ? p1Name : p2Name} Wins Round {state.round}!
            </span>
          </div>
        )}

        {state.status === STATUS_DRAW && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/50 shadow-md text-blue-400 text-xs font-bold animate-in fade-in zoom-in-95 duration-200">
            <span>Board Full — Match Ended in a Draw!</span>
          </div>
        )}
      </div>

      {/* Main Connect Four Board */}
      <ConnectFourBoard
        board={state.board}
        turn={state.turn}
        status={state.status}
        winningCells={state.winningCells}
        lastMove={state.lastMove}
        focusedColumn={focusedColumn}
        onDrop={(col) => onDrop(col)}
        onColumnFocus={onColumnFocus}
        disabled={state.isAiThinking}
      />

      {/* Mobile Touch & Desktop Controls */}
      <ConnectFourControls
        board={state.board}
        turn={state.turn}
        status={state.status}
        onDrop={(col) => onDrop(col)}
        onResetRound={onResetRound}
        onResetMatch={onResetMatch}
        onOpenSetup={onOpenSetup}
        disabled={state.isAiThinking}
      />
    </div>
  );
}
