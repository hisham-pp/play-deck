'use client';

import React from 'react';
import { GRID_CONFIGS } from '../engine/runic-memory-constants';
import type { DifficultyLevel, RunicCard as RunicCardType } from '../types/runic-memory.types';
import { RunicCard } from './RunicCard';

interface RunicMemoryBoardProps {
  board: RunicCardType[];
  difficulty: DifficultyLevel;
  focusedIndex: number;
  disabled: boolean;
  onFlip: (index: number) => void;
}

export function RunicMemoryBoard({
  board,
  difficulty,
  focusedIndex,
  disabled,
  onFlip,
}: RunicMemoryBoardProps) {
  const config = GRID_CONFIGS[difficulty] || GRID_CONFIGS.apprentice;

  const gridColsClass =
    config.columns === 4
      ? 'grid-cols-3 sm:grid-cols-4'
      : config.columns === 6
        ? 'grid-cols-4 sm:grid-cols-6'
        : 'grid-cols-4';

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-base/70 border border-surface-border/90 shadow-2xl backdrop-blur-sm">
      <div className={`w-full grid ${gridColsClass} gap-2.5 sm:gap-3.5`}>
        {board.map((card) => (
          <RunicCard
            key={card.id}
            card={card}
            isFocused={card.index === focusedIndex}
            disabled={disabled}
            onFlip={onFlip}
          />
        ))}
      </div>
    </div>
  );
}
