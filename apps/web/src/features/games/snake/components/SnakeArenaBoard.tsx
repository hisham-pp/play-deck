'use client';

import React from 'react';
import type { Coordinate, Direction, SnakeGameStatus } from '../types/snake.types';
import { SnakeBoard } from './SnakeBoard';
import { SnakeOverlay } from './SnakeOverlay';

export interface SnakeArenaBoardProps {
  snake: Coordinate[];
  food: Coordinate;
  gridSize: number;
  direction: Direction;
  status: SnakeGameStatus;
  speedMs: number;
  countdown: number;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export function SnakeArenaBoard({
  snake,
  food,
  gridSize,
  direction,
  status,
  speedMs,
  countdown,
  score,
  highScore,
  isNewHighScore,
  onStart,
  onResume,
  onRestart,
}: SnakeArenaBoardProps) {
  return (
    <div className="relative w-full max-w-[min(100%,calc(100dvh-230px),580px)] aspect-square mx-auto flex items-center justify-center self-center">
      <SnakeBoard
        snake={snake}
        food={food}
        gridSize={gridSize}
        direction={direction}
        status={status}
        speedMs={speedMs}
      />
      <SnakeOverlay
        status={status}
        countdown={countdown}
        score={score}
        highScore={highScore}
        isNewHighScore={isNewHighScore}
        onStart={onStart}
        onResume={onResume}
        onRestart={onRestart}
      />
    </div>
  );
}
