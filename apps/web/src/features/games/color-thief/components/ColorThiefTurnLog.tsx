'use client';

import React from 'react';
import type { ColorThiefLogEntry, ColorThiefSeat } from '../types/color-thief.types';
import { paintTheme } from '../utils/color-thief-colors';

export interface ColorThiefTurnLogProps {
  log: ColorThiefLogEntry[];
  seats: ColorThiefSeat[];
}

const VISIBLE_ENTRIES = 6;

/** The recent history of the arena, newest first. */
export function ColorThiefTurnLog({ log, seats }: ColorThiefTurnLogProps) {
  const recent = [...log].slice(-VISIBLE_ENTRIES).reverse();
  if (recent.length === 0) return null;

  return (
    <ol
      aria-label="Recent moves"
      className="flex w-full flex-col gap-1 rounded-lg border border-slate-800 bg-slate-950/60 p-2"
    >
      {recent.map((entry) => {
        const seat = seats.find((s) => s.seatIndex === entry.seatIndex);
        const theme = seat ? paintTheme(seat.color) : null;

        return (
          <li key={entry.id} className="flex items-baseline gap-2 text-[11px] leading-snug">
            <span
              className="w-3 shrink-0 text-center font-black"
              style={{ color: theme?.hex ?? '#475569' }}
              aria-hidden="true"
            >
              {theme?.glyph ?? '·'}
            </span>
            <span className="min-w-0 flex-1 text-slate-400">
              {seat && <span className="font-semibold text-slate-300">{seat.displayName}: </span>}
              {entry.message}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
