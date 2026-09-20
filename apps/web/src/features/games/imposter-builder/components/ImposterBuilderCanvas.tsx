'use client';

import React from 'react';

import type { BuildCell } from '../types/imposter-builder.types';

interface Props {
  grid: BuildCell[][];
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  onCellToggle: (row: number, col: number) => void;
  isHost: boolean;
  onReveal: () => void;
}

export function ImposterBuilderCanvas({
  grid,
  colors,
  selectedColor,
  onColorSelect,
  onCellToggle,
  isHost,
  onReveal,
}: Props) {
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex gap-2 flex-wrap">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => onColorSelect(c)}
            className={`w-7 h-7 rounded-full border-2 transition-transform ${selectedColor === c ? 'border-white scale-125' : 'border-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div
        className="grid border border-surface-border rounded-xl overflow-hidden"
        style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 8}, 1fr)` }}
      >
        {grid.map((row, ri) =>
          row.map((cell, ci) => (
            <button
              key={`${ri}-${ci}`}
              onClick={() => onCellToggle(ri, ci)}
              className="aspect-square border border-surface-border/30 transition-all hover:opacity-80"
              style={{
                backgroundColor: cell.filled ? cell.color : 'transparent',
              }}
            />
          )),
        )}
      </div>
      {isHost && (
        <button
          onClick={onReveal}
          className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-surface-base font-black text-sm uppercase tracking-wider transition-colors"
        >
          Reveal All Builds →
        </button>
      )}
    </div>
  );
}
