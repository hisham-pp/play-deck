'use client';

import React from 'react';
import type { TetrominoType } from '../types/tetris.types';
import { TetrisMiniPiece } from './TetrisMiniPiece';

interface TetrisNextQueueProps {
  queue: TetrominoType[];
}

export function TetrisNextQueue({ queue }: TetrisNextQueueProps) {
  const preview = queue.slice(0, 3);

  return (
    <div className="w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-raised/80 border border-surface-border shadow-arcade text-xs">
      <span className="text-[10px] font-bold text-deck-400 uppercase tracking-widest font-mono">
        Next
      </span>
      <div className="flex flex-col gap-1.5">
        {preview.map((type, index) => (
          <div
            key={`${type}-${index}`}
            className="flex items-center justify-center p-2 rounded-xl bg-surface-base/80 border border-surface-border"
          >
            <TetrisMiniPiece type={type} cellPx={index === 0 ? 12 : 9} />
          </div>
        ))}
      </div>
    </div>
  );
}
