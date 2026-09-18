'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { ColorThiefColor } from '../types/color-thief.types';
import { paintTheme, tileFill } from '../utils/color-thief-colors';

export interface ColorThiefTileProps {
  index: number;
  color: ColorThiefColor | null;
  frozen: boolean;
  /** Paint price for the seat on turn, or null when the tile is not claimable. */
  cost: number | null;
  selectable: boolean;
  selected: boolean;
  isFocusTarget: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  /** True for the stroke just played, which is what makes the spread readable. */
  justClaimed: boolean;
  label: string;
  onSelect: (index: number) => void;
  onFocus: (index: number) => void;
  registerRef: (node: HTMLButtonElement | null) => void;
}

function TileComponent({
  index,
  color,
  frozen,
  cost,
  selectable,
  selected,
  isFocusTarget,
  highContrast,
  reducedMotion,
  justClaimed,
  label,
  onSelect,
  onFocus,
  registerRef,
}: ColorThiefTileProps) {
  const theme = color ? paintTheme(color) : null;

  return (
    <button
      ref={registerRef}
      type="button"
      role="gridcell"
      aria-label={label}
      aria-selected={selected}
      aria-disabled={!selectable}
      tabIndex={isFocusTarget ? 0 : -1}
      onClick={() => onSelect(index)}
      onFocus={() => onFocus(index)}
      className={cn(
        'relative flex aspect-square w-full items-center justify-center rounded-[3px] border text-[10px] font-black leading-none',
        'border-slate-950/50 outline-none',
        'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950',
        selectable && 'cursor-pointer hover:brightness-125',
        !selectable && 'cursor-not-allowed',
        selected && 'z-10 ring-2 ring-white',
        !reducedMotion && 'transition-[background-color,transform] duration-300 ease-out',
        !reducedMotion && justClaimed && 'scale-110',
      )}
      style={{
        backgroundColor: tileFill(color, highContrast, frozen),
        borderColor: theme ? theme.rimHex : '#1f2937',
        color: theme ? theme.rimHex : '#64748b',
      }}
    >
      {/* The glyph, not the hue, is what separates six seats at a glance. */}
      {theme && <span aria-hidden="true">{theme.glyph}</span>}

      {frozen && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[3px] bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(226,232,240,0.55)_3px,rgba(226,232,240,0.55)_5px)]"
        />
      )}

      {selectable && cost !== null && !theme && (
        <span className="absolute bottom-0 right-0.5 text-[8px] font-bold text-slate-400">
          {cost}
        </span>
      )}
    </button>
  );
}

/** The grid can run to 144 tiles, so a tile only re-renders when its own props move. */
export const ColorThiefTile = React.memo(TileComponent);
