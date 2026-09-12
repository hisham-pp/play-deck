'use client';

import { ArrowLeft, Users, Wifi } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@playdeck/ui';

interface LudoLobbyProps {
  onSelectOffline: () => void;
  onSelectOnline: () => void;
}

export function LudoLobby({ onSelectOffline, onSelectOnline }: LudoLobbyProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 py-4">
      <div className="w-full">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to games</span>
        </Link>
      </div>

      <div className="text-center flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tight text-deck-950 dark:text-white font-display">
          Ludo
        </h1>
        <p className="text-sm text-deck-500">Choose how you want to play</p>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          hoverable
          elevation="raised"
          className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center"
          onClick={onSelectOffline}
        >
          <Users className="w-8 h-8 text-amber-500" />
          <div>
            <p className="font-bold text-deck-950 dark:text-white">Play Offline</p>
            <p className="text-xs text-deck-500 mt-1">Local + Bots</p>
          </div>
        </Card>

        <Card
          hoverable
          elevation="raised"
          className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center"
          onClick={onSelectOnline}
        >
          <Wifi className="w-8 h-8 text-amber-500" />
          <div>
            <p className="font-bold text-deck-950 dark:text-white">Play Online</p>
            <p className="text-xs text-deck-500 mt-1">Friends + Bots</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
