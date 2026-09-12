'use client';

import React from 'react';
import { VISIBLE_ROWS, COLS } from '../engine/tetris-constants';
import type {
  ActivePiece,
  TetrisBoard as TetrisBoardType,
  TetrisGameStatus,
} from '../types/tetris.types';
import { TetrisBoard } from './TetrisBoard';
import { TetrisOverlay } from './TetrisOverlay';

export interface TetrisArenaBoardProps {
  board: TetrisBoardType;
  active: ActivePiece | null;
  status: TetrisGameStatus;
  countdown: number;
  score: number;
  highScore: number;
  linesCleared: number;
  isNewHighScore: boolean;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export function TetrisArenaBoard({
  board,
  active,
  status,
  countdown,
  score,
  highScore,
  linesCleared,
  isNewHighScore,
  onStart,
  onResume,
  onRestart,
}: TetrisArenaBoardProps) {
  return (
    <div
      className="relative w-full mx-auto flex items-center justify-center self-center"
      style={{
        maxWidth: `min(100%, calc((100dvh - 230px) * ${COLS / VISIBLE_ROWS}))`,
        aspectRatio: `${COLS} / ${VISIBLE_ROWS}`,
      }}
    >
      <TetrisBoard board={board} active={active} />
      <TetrisOverlay
        status={status}
        countdown={countdown}
        score={score}
        highScore={highScore}
        linesCleared={linesCleared}
        isNewHighScore={isNewHighScore}
        onStart={onStart}
        onResume={onResume}
        onRestart={onRestart}
      />
    </div>
  );
}
