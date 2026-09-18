'use client';

import { ArrowLeft, Users, Wifi } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Card } from '@playdeck/ui';

export interface ShadowTagLobbyProps {
  onSelectOffline: () => void;
  onSelectOnline: () => void;
}

export function ShadowTagLobby({ onSelectOffline, onSelectOnline }: ShadowTagLobbyProps) {
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
          Shadow Tag
        </h1>
        <p className="text-sm text-deck-500">
          Run in the shadows of orbiting lights. Step into the beam and your shadow betrays your
          position!
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <Card
          hoverable
          elevation="raised"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-10 text-center"
          onClick={onSelectOffline}
        >
          <Users className="h-8 w-8 text-amber-500" />
          <div>
            <p className="font-bold text-deck-950 dark:text-white">Play Offline</p>
            <p className="mt-1 text-xs text-deck-500">Solo vs AI shadows or pass &amp; play</p>
          </div>
        </Card>

        <Card
          hoverable
          elevation="raised"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 px-6 py-10 text-center"
          onClick={onSelectOnline}
        >
          <Wifi className="h-8 w-8 text-amber-500" />
          <div>
            <p className="font-bold text-deck-950 dark:text-white">Play Online</p>
            <p className="mt-1 text-xs text-deck-500">Invite code, link &amp; voice chat</p>
          </div>
        </Card>
      </div>

      <div className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          How it works
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Orbiting spotlights cast dynamic shadows from pillars and obstacles. As long as you stay
          in the dark, you remain invisible to the chaser. Sneaking keeps your footprints quiet,
          while interacting with lamps can briefly cut the light or reverse its direction.
        </p>
      </div>
    </div>
  );
}
