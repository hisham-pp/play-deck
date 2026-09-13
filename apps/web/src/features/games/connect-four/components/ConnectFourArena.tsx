'use client';

import React from 'react';
import { usePlayerStore } from '@/stores/player.store';
import {
  AI_DEFAULT_NAME,
  DISC_RED,
  DISC_YELLOW,
  MODE_SINGLE,
  PLAYER_1_DEFAULT_NAME,
  PLAYER_2_DEFAULT_NAME,
  STATUS_PLAYING,
} from '../engine/connect-four-constants';
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
    <div className="w-full grid grid-cols-2 md:grid-cols-[220px_minmax(0,1fr)_220px] lg:grid-cols-[260px_minmax(0,1fr)_260px] items-start justify-center gap-3 lg:gap-5">
      {/* LEFT COLUMN: PLAYER 1 STATION */}
      <div className="col-span-1 md:col-start-1 md:row-start-1 flex flex-col gap-3">
        <ConnectFourPlayerCard
          name={p1Name}
          avatar={player?.avatar}
          score={state.scores.R}
          disc={DISC_RED}
          isActive={state.status === STATUS_PLAYING && isP1Turn}
          roleLabel="Red Discs (First)"
        />

        <div className="hidden md:flex flex-col gap-3">
          <ConnectFourInfoCard
            round={state.round}
            mode={state.mode}
            difficulty={state.aiDifficulty}
            ties={state.scores.ties}
          />
          <ConnectFourKeyboardCard />
        </div>
      </div>

      {/* RIGHT COLUMN: PLAYER 2 / AI STATION */}
      <div className="col-span-1 md:col-start-3 md:row-start-1 flex flex-col gap-3">
        <ConnectFourPlayerCard
          name={p2Name}
          score={state.scores.Y}
          disc={DISC_YELLOW}
          isActive={state.status === STATUS_PLAYING && isP2Turn}
          isAiThinking={isSingle && state.turn === DISC_YELLOW && state.isAiThinking}
          roleLabel={isSingle ? 'Yellow Discs (AI)' : 'Yellow Discs (Second)'}
          isAI={isSingle}
        />

        <div className="hidden md:flex flex-col gap-3">
          <ConnectFourColumnCard
            board={state.board}
            turn={state.turn}
            status={state.status}
            disabled={state.isAiThinking}
            onDrop={onDrop}
          />
          <ConnectFourActionsCard
            onResetRound={onResetRound}
            onResetMatch={onResetMatch}
            onOpenSetup={onOpenSetup}
            disabled={state.isAiThinking}
          />
        </div>
      </div>

      {/* CENTER COLUMN: 7x6 GAME ARENA */}
      <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-3 self-center flex flex-col items-center gap-3">
        <ConnectFourStatusBanner
          state={state}
          p1Name={p1Name}
          p2Name={p2Name}
          isP1Turn={isP1Turn}
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
          disabled={state.isAiThinking}
        />
      </div>

      {/* MOBILE ONLY: MATCH INFO & CONTROLS (Below Board on small screens) */}
      <div className="col-span-1 md:hidden flex flex-col gap-3">
        <ConnectFourInfoCard
          round={state.round}
          mode={state.mode}
          difficulty={state.aiDifficulty}
          ties={state.scores.ties}
        />
      </div>

      <div className="col-span-1 md:hidden flex flex-col gap-3">
        <ConnectFourActionsCard
          onResetRound={onResetRound}
          onResetMatch={onResetMatch}
          onOpenSetup={onOpenSetup}
          disabled={state.isAiThinking}
        />
      </div>

      <div className="col-span-2 md:hidden flex flex-col gap-3">
        <ConnectFourColumnCard
          board={state.board}
          turn={state.turn}
          status={state.status}
          disabled={state.isAiThinking}
          onDrop={onDrop}
        />
        <ConnectFourKeyboardCard />
      </div>
    </div>
  );
}
