'use client';

import { ArrowLeft, Play, Volume2 } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import { HEIST_MS, MAX_SEATS, MIN_SEATS, SEAT_COLORS } from '../engine/giant-constants';
import { MAP_IDS, mapName } from '../engine/map-layout';
import type { GiantSeat } from '../types/giant.types';

export interface GiantOfflineSetupProps {
  onBack: () => void;
  onStart: (seats: GiantSeat[], mapId: string, heistMs: number) => void;
}

const BOT_NAMES = ['Mouse', 'Pinch', 'Sable', 'Tuppence', 'Quill'];
/** The crew is 3–6, so the offline setup only offers the bot counts that fit. */
const BOT_COUNTS = Array.from({ length: MAX_SEATS - MIN_SEATS + 1 }, (_, i) => MIN_SEATS - 1 + i);

export function GiantOfflineSetup({ onBack, onStart }: GiantOfflineSetupProps) {
  const player = usePlayerStore((s) => s.player);
  const [botCount, setBotCount] = useState(MIN_SEATS - 1);
  const [mapId, setMapId] = useState(MAP_IDS[0]);

  const handleLaunch = () => {
    const human: GiantSeat = {
      id: player?.id || 'p1',
      displayName: player?.displayName || 'Player 1',
      avatar: player?.avatar || '👤',
      type: 'human',
      seatIndex: 0,
      color: SEAT_COLORS[0],
    };

    const bots: GiantSeat[] = Array.from({ length: botCount }, (_, i) => ({
      id: `bot-${i + 1}`,
      displayName: BOT_NAMES[i] || `Burglar ${i + 1}`,
      avatar: '🤖',
      type: 'bot',
      seatIndex: i + 1,
      color: SEAT_COLORS[(i + 1) % SEAT_COLORS.length],
    }));

    onStart([human, ...bots], mapId, HEIST_MS);
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 py-4">
      <div className="w-full">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
      </div>

      <Card className="border-[#1e293b] bg-[#0b101d]">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Plan the heist</CardTitle>
          <p className="text-xs text-slate-400">
            Pick a chamber and a crew. The AI burglars tiptoe when the meter climbs, but they are
            not as careful as you are.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              AI crew ({botCount})
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BOT_COUNTS.map((count) => (
                <Button
                  key={count}
                  variant={botCount === count ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setBotCount(count)}
                  className="font-mono text-sm"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Chamber
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {MAP_IDS.map((id) => (
                <Button
                  key={id}
                  variant={mapId === id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setMapId(id)}
                  className="truncate text-xs"
                >
                  {mapName(id)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
            <Volume2 className="h-5 w-5 shrink-0 text-amber-400" />
            <span>
              WASD to move, Shift to run, C to tiptoe, E to take what is in reach. Moss and rugs
              swallow the sound you make while you stand on them.
            </span>
          </div>

          <Button onClick={handleLaunch} className="gap-2 font-bold">
            <Play className="h-4 w-4 fill-current" />
            <span>Enter the chamber</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
