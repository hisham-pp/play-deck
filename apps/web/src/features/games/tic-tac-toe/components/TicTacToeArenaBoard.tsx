'use client';

import React from 'react';
import { STATUS_PLAYING } from '../engine/tic-tac-toe-constants';
import type { PlayerMark, TicTacToeState } from '../types/tic-tac-toe.types';
import { TicTacToeBoard } from './TicTacToeBoard';
import { TicTacToeOverlay } from './TicTacToeOverlay';

export interface TicTacToeArenaBoardProps {
  state: TicTacToeState;
  focusedIndex: number;
  myMark?: PlayerMark | null;
  playerXName: string;
  playerOName: string;
  onMove: (index: number) => void;
  onCellFocus: (index: number) => void;
  onNextRound: () => void;
  onResetMatch: () => void;
}

export function TicTacToeArenaBoard({
  state,
  focusedIndex,
  myMark,
  playerXName,
  playerOName,
  onMove,
  onCellFocus,
  onNextRound,
  onResetMatch,
}: TicTacToeArenaBoardProps) {
  return (
    <div className="relative w-full flex items-center justify-center self-center">
      <TicTacToeBoard
        board={state.board}
        winningLine={state.winningLine}
        focusedIndex={focusedIndex}
        disabled={state.status !== STATUS_PLAYING || state.isAiThinking}
        onCellClick={onMove}
        onCellFocus={onCellFocus}
      />

      <TicTacToeOverlay
        status={state.status}
        winner={state.winner}
        mode={state.mode}
        humanPlayerMark={state.humanPlayerMark}
        myMark={myMark}
        playerXName={playerXName}
        playerOName={playerOName}
        onNextRound={onNextRound}
        onResetMatch={onResetMatch}
      />
    </div>
  );
}
