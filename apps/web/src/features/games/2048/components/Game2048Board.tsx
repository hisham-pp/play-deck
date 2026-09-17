import React from 'react';
import type { TileItem } from '../types/2048.types';
import { Game2048Tile } from './Game2048Tile';

interface Game2048BoardProps {
  tiles: TileItem[];
  containerRef?: React.Ref<HTMLDivElement>;
}

export function Game2048Board({ tiles, containerRef }: Game2048BoardProps) {
  // Empty background grid slots (4x4 = 16 cells)
  const emptySlots = Array.from({ length: 16 }, (_, idx) => idx);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label="2048 Puzzle Grid"
      className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-square rounded-2xl bg-deck-950/80 p-2 sm:p-2.5 border-2 border-deck-700/60 shadow-2xl shadow-black/80 select-none outline-none focus:ring-2 focus:ring-amber-500/50 touch-none"
    >
      {/* Background Slots */}
      <div className="grid grid-cols-4 grid-rows-4 w-full h-full gap-2 sm:gap-2.5">
        {emptySlots.map((index) => (
          <div
            key={`slot-${index}`}
            className="w-full h-full rounded-xl bg-deck-900/70 border border-deck-800/40 shadow-inner shadow-black/40"
          />
        ))}
      </div>

      {/* Dynamic Animated Tiles Layer */}
      <div className="absolute inset-2 sm:inset-2.5 pointer-events-none">
        {tiles.map((tile) => (
          <Game2048Tile key={tile.id} tile={tile} />
        ))}
      </div>
    </div>
  );
}
