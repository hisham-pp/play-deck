'use client';

import React from 'react';
import type { RunicCard as RunicCardType } from '../types/runic-memory.types';

interface RunicCardProps {
  card: RunicCardType;
  isFocused: boolean;
  disabled: boolean;
  onFlip: (index: number) => void;
}

export function RunicCard({ card, isFocused, disabled, onFlip }: RunicCardProps) {
  const { index, rune, isFlipped, isMatched } = card;

  const handleClick = () => {
    if (disabled || isFlipped || isMatched) return;
    onFlip(index);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isMatched}
      aria-label={`Rune Card ${index + 1}${isFlipped || isMatched ? `: ${rune.name}` : ''}`}
      className={`relative w-full aspect-[3/4] rounded-xl transition-all duration-300 transform outline-none focus:outline-none select-none group [perspective:1000px] ${
        isFocused ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-deck-950 scale-105 z-10' : ''
      } ${isMatched ? 'cursor-default opacity-85' : disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.03]'}`}
    >
      <div
        className={`w-full h-full relative rounded-xl transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped || isMatched ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* CARD BACK (UNFLIPPED STONE) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl border [backface-visibility:hidden] flex flex-col items-center justify-between p-2.5 transition-colors shadow-md ${
            isFocused
              ? 'border-amber-400 bg-surface-raised shadow-amber-500/20'
              : 'border-surface-border/80 bg-surface-overlay/90 group-hover:border-purple-500/50 group-hover:bg-surface-raised'
          }`}
        >
          {/* Card Number Badge for voice & keyboard */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono text-deck-500">
            <span className="opacity-60 font-bold">#{index + 1}</span>
            <span className="text-purple-400/40 text-xs">✦</span>
          </div>

          {/* Ornate Stone Seal Back */}
          <div className="relative w-12 h-12 rounded-full border border-purple-500/30 flex items-center justify-center bg-purple-950/20 group-hover:border-purple-400/50 transition-colors">
            <div className="w-8 h-8 rounded-full border border-dashed border-amber-500/30 flex items-center justify-center">
              <span className="text-amber-400/60 text-lg font-serif">ᛟ</span>
            </div>
            <div className="absolute inset-0 rounded-full group-hover:animate-ping opacity-10 bg-purple-500 pointer-events-none" />
          </div>

          <span className="text-[10px] tracking-wider uppercase font-semibold text-deck-500/80">
            Sigil
          </span>
        </div>

        {/* CARD FRONT (FLIPPED RUNIC FACE) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl border [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-between p-2.5 shadow-lg overflow-hidden ${
            isMatched
              ? 'border-emerald-400/60 bg-gradient-to-b from-emerald-950/40 via-surface-overlay to-surface-raised shadow-emerald-500/20 ring-1 ring-emerald-400/40'
              : 'border-purple-400/60 bg-gradient-to-b from-purple-950/40 via-surface-overlay to-surface-raised shadow-purple-500/25'
          }`}
        >
          {/* Top Header */}
          <div className="w-full flex justify-between items-center text-[10px] font-mono">
            <span className="text-deck-400 font-semibold">#{index + 1}</span>
            <span
              className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${rune.primaryColor}22`,
                color: rune.primaryColor,
              }}
            >
              {rune.element}
            </span>
          </div>

          {/* Glowing Ancient Rune Glyph */}
          <div className="relative flex flex-col items-center justify-center py-1">
            <span
              className="text-4xl md:text-5xl font-black transition-transform duration-300 drop-shadow-md select-none font-serif"
              style={{
                color: rune.primaryColor,
                textShadow: `0 0 16px ${rune.primaryColor}99, 0 0 32px ${rune.secondaryColor}66`,
              }}
            >
              {rune.glyph}
            </span>

            {/* Subtle glow orb behind glyph */}
            <div
              className="absolute w-14 h-14 rounded-full blur-xl -z-10 opacity-30 pointer-events-none"
              style={{ backgroundColor: rune.primaryColor }}
            />
          </div>

          {/* Bottom Rune Info */}
          <div className="w-full flex flex-col items-center text-center">
            <span className="text-xs font-bold text-white tracking-wide">{rune.name}</span>
            <span className="text-[9px] text-deck-400 line-clamp-1 max-w-[90%]">
              {rune.meaning.split('&')[0]}
            </span>
          </div>

          {/* Matched Lock Badge */}
          {isMatched && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
      </div>
    </button>
  );
}
