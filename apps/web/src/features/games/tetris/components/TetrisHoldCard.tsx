'use client';

import { Lock } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import type { TetrominoType } from '../types/tetris.types';
import { TetrisMiniPiece } from './TetrisMiniPiece';

interface TetrisHoldCardProps {
  holdType: TetrominoType | null;
  canHold: boolean;
}

export function TetrisHoldCard({ holdType, canHold }: TetrisHoldCardProps) {
  return (
    <div className="w-full flex flex-col gap-2.5 p-3 rounded-2xl bg-surface-raised/80 border border-surface-border shadow-arcade text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-deck-400 uppercase tracking-widest font-mono">
          Hold
        </span>
        {!canHold && <Lock className="w-3 h-3 text-deck-500" />}
      </div>
      <div
        className={cn(
          'flex items-center justify-center p-2 rounded-xl bg-surface-base/80 border border-surface-border min-h-[56px]',
          !canHold && 'opacity-50',
        )}
      >
        {holdType ? (
          <TetrisMiniPiece type={holdType} cellPx={12} />
        ) : (
          <span className="text-[10px] text-deck-600 font-mono">Empty</span>
        )}
      </div>
    </div>
  );
}
