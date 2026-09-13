'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { Coordinate, Direction, SnakeGameStatus } from '../types/snake.types';

interface SnakeBoardProps {
  snake: Coordinate[];
  food: Coordinate;
  gridSize: number;
  direction: Direction;
  status: SnakeGameStatus;
  speedMs: number;
}

const SnakeScene = dynamic(() => import('./three/SnakeScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-deck-400">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <span className="text-xs font-medium">Building 3D arena…</span>
      </div>
    </div>
  ),
});

/** Square shell hosting the 3D arena; all rendering lives in the WebGL scene. */
export function SnakeBoard({ snake, food, gridSize, direction, status, speedMs }: SnakeBoardProps) {
  return (
    <div className="relative w-full h-full aspect-square rounded-2xl overflow-hidden border border-surface-border shadow-2xl bg-[#05070c] flex items-center justify-center">
      <SnakeScene
        snake={snake}
        food={food}
        gridSize={gridSize}
        direction={direction}
        status={status}
        speedMs={speedMs}
      />
    </div>
  );
}
