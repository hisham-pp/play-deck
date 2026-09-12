'use client';

import React from 'react';
import { MARK_O, MARK_X, STATUS_PLAYING } from '../engine/tic-tac-toe-constants';
import type { TicTacToeState } from '../types/tic-tac-toe.types';
import { TicTacToeActionsCard } from './TicTacToeActionsCard';
import { TicTacToeArenaBoard } from './TicTacToeArenaBoard';
import { TicTacToeInfoCard } from './TicTacToeInfoCard';
import { TicTacToePlayerCard } from './TicTacToePlayerCard';

export interface PlayerDisplayInfo {
  name: string;
  avatar: string;
  role: string;
  isMe: boolean;
}

export interface TicTacToeArenaGridProps {
  state: TicTacToeState;
  playerX: PlayerDisplayInfo;
  playerO: PlayerDisplayInfo;
  focusedIndex: number;
  myMark: 'X' | 'O' | null;
  roomCode: string | null;
  opponentId?: string;
  friendStatus?: 'none' | 'pending' | 'friends';
  onMove: (idx: number) => void;
  onCellFocus: (idx: number) => void;
  onResetRound: () => void;
  onResetMatch: () => void;
  onLeaveRoom: () => void;
  onOpenSetup: () => void;
  onAddFriend?: (opponentId: string) => void;
}

export function TicTacToeArenaGrid({
  state,
  playerX,
  playerO,
  focusedIndex,
  myMark,
  roomCode,
  opponentId,
  friendStatus,
  onMove,
  onCellFocus,
  onResetRound,
  onResetMatch,
  onLeaveRoom,
  onOpenSetup,
  onAddFriend,
}: TicTacToeArenaGridProps) {
  const isSingle = state.mode === 'single';

  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-[200px_minmax(0,1fr)_200px] lg:grid-cols-[220px_minmax(0,1fr)_220px] items-start justify-center gap-3 lg:gap-5">
      {/* PLAYER X STATION */}
      <div className="col-span-1 md:col-start-1 md:row-start-1 flex justify-center">
        <TicTacToePlayerCard
          mark={MARK_X}
          name={playerX.name}
          avatar={playerX.avatar}
          roleTag={playerX.role}
          score={state.scores.X}
          isActive={state.status === STATUS_PLAYING && state.turn === MARK_X}
          isMe={playerX.isMe}
          isAiThinking={isSingle && state.turn === MARK_X && state.isAiThinking}
          opponentId={!playerX.isMe ? opponentId : undefined}
          friendStatus={!playerX.isMe ? friendStatus : undefined}
          onAddFriend={!playerX.isMe ? onAddFriend : undefined}
        />
      </div>

      {/* PLAYER O STATION */}
      <div className="col-span-1 md:col-start-3 md:row-start-1 flex justify-center">
        <TicTacToePlayerCard
          mark={MARK_O}
          name={playerO.name}
          avatar={playerO.avatar}
          roleTag={playerO.role}
          score={state.scores.O}
          isActive={state.status === STATUS_PLAYING && state.turn === MARK_O}
          isMe={playerO.isMe}
          isAiThinking={isSingle && state.turn === MARK_O && state.isAiThinking}
          opponentId={!playerO.isMe ? opponentId : undefined}
          friendStatus={!playerO.isMe ? friendStatus : undefined}
          onAddFriend={!playerO.isMe ? onAddFriend : undefined}
        />
      </div>

      {/* CENTER ARENA: Max-Height Board */}
      <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-2 self-center flex items-center justify-center">
        <TicTacToeArenaBoard
          state={state}
          focusedIndex={focusedIndex}
          myMark={myMark}
          playerXName={playerX.name}
          playerOName={playerO.name}
          onMove={onMove}
          onCellFocus={onCellFocus}
          onNextRound={onResetRound}
          onResetMatch={onResetMatch}
        />
      </div>

      {/* MATCH INFO */}
      <div className="col-span-1 md:col-start-1 md:row-start-2 flex justify-center">
        <TicTacToeInfoCard
          round={state.round}
          ties={state.scores.ties}
          mode={state.mode}
          roomCode={roomCode}
          aiDifficulty={state.aiDifficulty}
        />
      </div>

      {/* ACTIONS */}
      <div className="col-span-1 md:col-start-3 md:row-start-2 flex justify-center">
        <TicTacToeActionsCard
          mode={state.mode}
          roomCode={roomCode}
          onOpenSetup={onOpenSetup}
          onResetRound={onResetRound}
          onResetMatch={onResetMatch}
          onLeaveRoom={onLeaveRoom}
        />
      </div>
    </div>
  );
}
