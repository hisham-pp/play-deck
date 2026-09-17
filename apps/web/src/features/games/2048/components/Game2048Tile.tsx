import React from 'react';
import { DEFAULT_SUPER_TILE_STYLE, TILE_STYLES } from '../engine/game-2048-constants';
import type { TileItem } from '../types/2048.types';

interface Game2048TileProps {
  tile: TileItem;
}

export const Game2048Tile = React.memo(function Game2048Tile({ tile }: Game2048TileProps) {
  const styleConfig = TILE_STYLES[tile.value] ?? DEFAULT_SUPER_TILE_STYLE;
  const fontSize =
    styleConfig.fontSize ??
    (tile.value < 100
      ? 'text-2xl sm:text-3xl md:text-4xl'
      : tile.value < 1000
        ? 'text-xl sm:text-2xl md:text-3xl'
        : 'text-lg sm:text-xl md:text-2xl');

  return (
    <div
      className="absolute top-0 left-0 w-1/4 h-1/4 p-1 sm:p-1.5 pointer-events-none transition-transform duration-100 ease-out will-change-transform"
      style={{
        transform: `translate(${tile.col * 100}%, ${tile.row * 100}%)`,
      }}
    >
      <div
        className={`w-full h-full rounded-xl flex items-center justify-center font-display font-black select-none ${styleConfig.bg} ${styleConfig.text} ${styleConfig.glow ?? ''} ${styleConfig.border ?? ''} ${fontSize} ${
          tile.isNew ? 'animate-in zoom-in-50 duration-150' : ''
        } ${tile.isMerged ? 'animate-in zoom-in-110 duration-150' : ''}`}
      >
        {tile.value}
      </div>
    </div>
  );
});
