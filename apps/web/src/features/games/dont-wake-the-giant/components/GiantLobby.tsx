'use client';

import { ArrowLeft, Users, Wifi } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Card } from '@playdeck/ui';

export interface GiantLobbyProps {
  onSelectOffline: () => void;
  onSelectOnline: () => void;
}

export function GiantLobby({ onSelectOffline, onSelectOnline }: GiantLobbyProps) {
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
          Don&apos;t Wake the Giant
        </h1>
        <p className="text-sm text-deck-500">
          Rob a sleeping giant together. Every step, every grab, every collision adds to one shared
          noise meter — and if it fills, everybody loses.
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
            <p className="mt-1 text-xs text-deck-500">Lead a crew of AI burglars</p>
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
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Treasure is scattered around a giant asleep in the middle of the room. Walking is quiet,
          running is not, and bumping into a wall or a team-mate is worse than either. At half a
          meter he stirs and his arms shift, closing off routes. At three quarters they start
          sweeping the floor. Fill it and the heist is over for everyone — so talk quietly, spread
          out, and get back to the door before the clock does.
        </p>
      </div>
    </div>
  );
}
