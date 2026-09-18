'use client';

import { ArrowLeft, Users, Wifi } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Card } from '@playdeck/ui';
import { ABILITIES } from '../engine/color-thief-constants';
import { paintTheme } from '../utils/color-thief-colors';

export interface ColorThiefLobbyProps {
  onSelectOffline: () => void;
  onSelectOnline: () => void;
}

const COLOR_ORDER = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;

export function ColorThiefLobby({ onSelectOffline, onSelectOnline }: ColorThiefLobbyProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 py-4">
      <div className="w-full">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-deck-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to games</span>
        </Link>
      </div>

      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-display text-3xl font-black tracking-tight text-deck-950 dark:text-white">
          Color Thief
        </h1>
        <p className="text-sm text-deck-500">
          Steal the grid one tile at a time. Every colour hides an ability.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          hoverable
          elevation="raised"
          className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
          onClick={onSelectOffline}
        >
          <Users className="h-8 w-8 text-amber-500" />
          <div>
            <p className="font-bold text-deck-950 dark:text-white">Play Offline</p>
            <p className="mt-1 text-xs text-deck-500">Pass-and-play or vs bots</p>
          </div>
        </Card>

        <Card
          hoverable
          elevation="raised"
          className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center"
          onClick={onSelectOnline}
        >
          <Wifi className="h-8 w-8 text-amber-500" />
          <div>
            <p className="font-bold text-deck-950 dark:text-white">Play Online</p>
            <p className="mt-1 text-xs text-deck-500">Room code, link &amp; voice chat</p>
          </div>
        </Card>
      </div>

      <div className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          The six paints
        </h2>
        <p className="mt-1 text-[11px] text-slate-500">
          A colour&apos;s ability stays hidden from the table until its owner uses it.
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COLOR_ORDER.map((color) => {
            const theme = paintTheme(color);
            const ability = Object.values(ABILITIES).find((entry) => entry.color === color)!;
            return (
              <li key={color} className="flex items-center gap-2">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded border text-[10px] font-black"
                  style={{
                    background: theme.hex,
                    borderColor: theme.rimHex,
                    color: theme.rimHex,
                  }}
                  aria-hidden="true"
                >
                  {theme.glyph}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-slate-300">
                    {theme.label}
                  </span>
                  <span className="block truncate text-[10px] text-slate-500">{ability.name}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
