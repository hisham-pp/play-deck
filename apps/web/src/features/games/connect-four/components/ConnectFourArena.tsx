'use client';

import React from 'react';
import {
  DISC_RED,
  DISC_YELLOW,
  MODE_MULTIPLAYER,
  MODE_SINGLE,
  STATUS_PLAYING,
} from '../engine/connect-four-constants';
import type { ConnectFourPlayerDisplay } from '../hooks/use-connect-four-players';
import type { ConnectFourDisc, ConnectFourState } from '../types/connect-four.types';
import { ConnectFourActionsCard } from './ConnectFourActionsCard';
import { ConnectFourBoard } from './ConnectFourBoard';
import { ConnectFourColumnCard } from './ConnectFourColumnCard';
import { ConnectFourInfoCard } from './ConnectFourInfoCard';
import { ConnectFourKeyboardCard } from './ConnectFourKeyboardCard';
import { ConnectFourPlayerCard } from './ConnectFourPlayerCard';
import { ConnectFourStatusBanner } from './ConnectFourStatusBanner';

export interface ConnectFourArenaProps {
  state: ConnectFourState;
  player1: ConnectFourPlayerDisplay;
  player2: ConnectFourPlayerDisplay;
  focusedColumn: number;
  roomCode?: string | null;
  myDisc?: ConnectFourDisc | null;
  onDrop: (column: number, player?: ConnectFourDisc) => void;
  onColumnFocus: (column: number) => void;
  onResetRound: () => void;
  onResetMatch: () => void;
  onOpenSetup: () => void;
  onLeaveRoom?: () => void;
}

export function ConnectFourArena({
  state,
  player1,
  player2,
  focusedColumn,
  roomCode,
  myDisc,
  onDrop,
  onColumnFocus,
  onResetRound,
  onResetMatch,
  onOpenSetup,
  onLeaveRoom,
}: ConnectFourArenaProps) {
  const isSingle = state.mode === MODE_SINGLE;
  const isMultiplayer = state.mode === MODE_MULTIPLAYER;
  const isP1Turn = state.turn === DISC_RED;
  const isP2Turn = state.turn === DISC_YELLOW;

  const isDropDisabled =
    state.isAiThinking || (isMultiplayer && Boolean(myDisc) && state.turn !== myDisc);

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-[220px_minmax(0,1fr)_220px] lg:grid-cols-[260px_minmax(0,1fr)_260px] items-start justify-center gap-3 lg:gap-5">
      {/* LEFT COLUMN: PLAYER 1 STATION */}
      <div className="col-span-1 md:col-start-1 md:row-start-1 flex flex-col gap-3">
        <ConnectFourPlayerCard
          name={player1.name}
          avatar={player1.avatar}
          score={state.scores.R}
          disc={DISC_RED}
          isActive={state.status === STATUS_PLAYING && isP1Turn}
          roleLabel={player1.roleTag}
          isAI={player1.isAI}
        />

        <div className="hidden md:flex flex-col gap-3">
          <ConnectFourInfoCard
            round={state.round}
            mode={state.mode}
            difficulty={state.aiDifficulty}
            ties={state.scores.ties}
            roomCode={roomCode}
          />
          <ConnectFourKeyboardCard />
        </div>
      </div>

      {/* RIGHT COLUMN: PLAYER 2 / AI STATION */}
      <div className="col-span-1 md:col-start-3 md:row-start-1 flex flex-col gap-3">
        <ConnectFourPlayerCard
          name={player2.name}
          avatar={player2.avatar}
          score={state.scores.Y}
          disc={DISC_YELLOW}
          isActive={state.status === STATUS_PLAYING && isP2Turn}
          isAiThinking={isSingle && state.turn === DISC_YELLOW && state.isAiThinking}
          roleLabel={player2.roleTag}
          isAI={player2.isAI}
        />

        <div className="hidden md:flex flex-col gap-3">
          <ConnectFourColumnCard
            board={state.board}
            turn={state.turn}
            status={state.status}
            disabled={isDropDisabled}
            onDrop={onDrop}
          />
          <ConnectFourActionsCard
            onResetRound={onResetRound}
            onResetMatch={onResetMatch}
            onOpenSetup={onOpenSetup}
            onLeaveRoom={onLeaveRoom}
            isMultiplayer={isMultiplayer}
            disabled={state.isAiThinking}
          />
        </div>
      </div>

      {/* CENTER COLUMN: 7x6 GAME ARENA */}
      <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-3 self-center flex flex-col items-center gap-3">
        <ConnectFourStatusBanner
          state={state}
          p1Name={player1.name}
          p2Name={player2.name}
          isP1Turn={isP1Turn}
          myDisc={myDisc}
        />

        <ConnectFourBoard
          board={state.board}
          turn={state.turn}
          status={state.status}
          winningCells={state.winningCells}
          lastMove={state.lastMove}
          focusedColumn={focusedColumn}
          onDrop={(col) => onDrop(col)}
          onColumnFocus={onColumnFocus}
          disabled={isDropDisabled}
        />
      </div>

      {/* MOBILE ONLY: MATCH INFO & CONTROLS (Below Board on small screens) */}
      <div className="col-span-1 md:hidden flex flex-col gap-3">
        <ConnectFourInfoCard
          round={state.round}
          mode={state.mode}
          difficulty={state.aiDifficulty}
          ties={state.scores.ties}
          roomCode={roomCode}
        />
      </div>

      <div className="col-span-1 md:hidden flex flex-col gap-3">
        <ConnectFourActionsCard
          onResetRound={onResetRound}
          onResetMatch={onResetMatch}
          onOpenSetup={onOpenSetup}
          onLeaveRoom={onLeaveRoom}
          isMultiplayer={isMultiplayer}
          disabled={state.isAiThinking}
        />
      </div>

      <div className="col-span-2 md:hidden flex flex-col gap-3">
        <ConnectFourColumnCard
          board={state.board}
          turn={state.turn}
          status={state.status}
          disabled={isDropDisabled}
          onDrop={onDrop}
        />
        <ConnectFourKeyboardCard />
      </div>
    </div>
  );
}
