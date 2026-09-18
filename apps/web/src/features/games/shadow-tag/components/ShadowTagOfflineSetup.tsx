'use client';

import { ArrowLeft, Play, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { usePlayerStore } from '@/stores/player.store';
import { ARENA_IDS, arenaName } from '../engine/arena-layout';
import { ROUND_MS, SEAT_COLORS } from '../engine/shadow-tag-constants';
import type { ShadowTagSeat } from '../types/shadow-tag.types';

export interface ShadowTagOfflineSetupProps {
  onBack: () => void;
  onStart: (seats: ShadowTagSeat[], arenaId: string, roundMs: number) => void;
}

const BOT_NAMES = ['Nyx', 'Umbra', 'Shade', 'Phantom', 'Eclipse'];

export function ShadowTagOfflineSetup({ onBack, onStart }: ShadowTagOfflineSetupProps) {
  const player = usePlayerStore((s) => s.player);
  const [botCount, setBotCount] = useState(3);
  const [arenaId, setArenaId] = useState('atrium');

  const handleLaunch = () => {
    const human: ShadowTagSeat = {
      id: player?.id || 'p1',
      displayName: player?.displayName || 'Player 1',
      avatar: player?.avatar || '👤',
      type: 'human',
      seatIndex: 0,
      color: SEAT_COLORS[0],
    };

    const bots: ShadowTagSeat[] = Array.from({ length: botCount }, (_, i) => ({
      id: `bot-${i + 1}`,
      displayName: BOT_NAMES[i] || `Bot ${i + 1}`,
      avatar: '🤖',
      type: 'bot',
      seatIndex: i + 1,
      color: SEAT_COLORS[(i + 1) % SEAT_COLORS.length],
    }));

    onStart([human, ...bots], arenaId, ROUND_MS);
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
          <CardTitle className="text-xl font-bold text-white">Offline Match Setup</CardTitle>
          <p className="text-xs text-slate-400">
            Configure your solo training match against AI shadow lurkers.
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              AI Opponents ({botCount})
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((count) => (
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
              Arena Blueprint
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {ARENA_IDS.map((id) => (
                <Button
                  key={id}
                  variant={arenaId === id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setArenaId(id)}
                  className="truncate text-xs capitalize"
                >
                  {arenaName(id)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
            <span>
              Use WASD / Arrow keys to run. Hold Shift to sneak silently without leaving dust
              footsteps.
            </span>
          </div>

          <Button onClick={handleLaunch} className="gap-2 font-bold">
            <Play className="h-4 w-4 fill-current" />
            <span>Enter Arena</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
