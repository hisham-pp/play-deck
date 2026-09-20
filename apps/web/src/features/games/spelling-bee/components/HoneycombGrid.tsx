'use client';

import React from 'react';

import { Button } from '@playdeck/ui';

interface Props {
  centerLetter: string;
  outerLetters: string[];
  onLetterClick: (letter: string) => void;
  onDelete: () => void;
  onShuffle: () => void;
  onSubmit: () => void;
}

const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

export function HoneycombGrid({
  centerLetter,
  outerLetters,
  onLetterClick,
  onDelete,
  onShuffle,
  onSubmit,
}: Props) {
  // Ensure we have 6 outer letters
  const l0 = outerLetters[0] || '';
  const l1 = outerLetters[1] || '';
  const l2 = outerLetters[2] || '';
  const l3 = outerLetters[3] || '';
  const l4 = outerLetters[4] || '';
  const l5 = outerLetters[5] || '';

  return (
    <div className="flex flex-col items-center select-none">
      {/* Honeycomb Container */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center">
        {/* Top Row: 2 tiles */}
        <div className="flex gap-2 -mb-3 sm:-mb-4 z-10">
          <HexTile letter={l0} onClick={() => onLetterClick(l0)} />
          <HexTile letter={l1} onClick={() => onLetterClick(l1)} />
        </div>

        {/* Middle Row: 3 tiles (Outer - Center - Outer) */}
        <div className="flex gap-2 z-20">
          <HexTile letter={l2} onClick={() => onLetterClick(l2)} />
          <HexTile letter={centerLetter} isCenter onClick={() => onLetterClick(centerLetter)} />
          <HexTile letter={l3} onClick={() => onLetterClick(l3)} />
        </div>

        {/* Bottom Row: 2 tiles */}
        <div className="flex gap-2 -mt-3 sm:-mt-4 z-10">
          <HexTile letter={l4} onClick={() => onLetterClick(l4)} />
          <HexTile letter={l5} onClick={() => onLetterClick(l5)} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6">
        <Button variant="secondary" size="sm" onClick={onDelete}>
          Delete
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onShuffle}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center text-lg"
          title="Shuffle outer letters (Spacebar)"
        >
          ⟳
        </Button>
        <Button variant="primary" size="sm" onClick={onSubmit}>
          Enter
        </Button>
      </div>
    </div>
  );
}

interface HexTileProps {
  letter: string;
  isCenter?: boolean;
  onClick: () => void;
}

function HexTile({ letter, isCenter = false, onClick }: HexTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ clipPath: HEX_CLIP }}
      className={`w-20 h-22 sm:w-22 sm:h-24 flex items-center justify-center font-bold text-2xl sm:text-3xl transition-transform active:scale-90 hover:brightness-110 shadow-lg ${
        isCenter
          ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 ring-2 ring-amber-300'
          : 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/60'
      }`}
    >
      {letter}
    </button>
  );
}
