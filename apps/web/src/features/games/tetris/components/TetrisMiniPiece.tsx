'use client';

import React from 'react';
import { PIECE_SHAPES } from '../engine/tetris-constants';
import type { TetrominoType } from '../types/tetris.types';

interface TetrisMiniPieceProps {
  type: TetrominoType;
  cellPx?: number;
}

const PIECE_COLOR_CLASS: Record<TetrominoType, string> = {
  I: 'bg-cyan-400',
  O: 'bg-yellow-400',
  T: 'bg-purple-400',
  S: 'bg-emerald-400',
  Z: 'bg-rose-400',
  J: 'bg-blue-400',
  L: 'bg-orange-400',
};

const GRID_SIZE = 4;

export function TetrisMiniPiece({ type, cellPx = 12 }: TetrisMiniPieceProps) {
  const cells = PIECE_SHAPES[type][0];
  const maxRow = Math.max(...cells.map((c) => c.row));
  const maxCol = Math.max(...cells.map((c) => c.col));
  const rowOffset = Math.floor((GRID_SIZE - 1 - maxRow) / 2);
  const colOffset = Math.floor((GRID_SIZE - 1 - maxCol) / 2);

  const occupied = new Set(cells.map((c) => `${c.row + rowOffset},${c.col + colOffset}`));

  return (
    <div
      className="grid gap-[2px]"
      style={{
        gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellPx}px)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, ${cellPx}px)`,
      }}
    >
      {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;
        const isFilled = occupied.has(`${row},${col}`);
        return (
          <div key={index} className={isFilled ? `rounded-[3px] ${PIECE_COLOR_CLASS[type]}` : ''} />
        );
      })}
    </div>
  );
}
