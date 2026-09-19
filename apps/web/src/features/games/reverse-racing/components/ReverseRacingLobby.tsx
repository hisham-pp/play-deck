'use client';

import { Bot, Play, Plus, Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@playdeck/ui';
import {
  reverseRacingStatsRepo,
  type ReverseRacingStats,
} from '../services/reverse-racing-stats-repository';

interface ReverseRacingLobbyProps {
  onStartSolo: (botCount: number) => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string) => void;
}

export function ReverseRacingLobby({
  onStartSolo,
  onCreateRoom,
  onJoinRoom,
}: ReverseRacingLobbyProps) {
  const [botCount, setBotCount] = useState(2);
  const [joinCode, setJoinCode] = useState('');
  const [stats, setStats] = useState<ReverseRacingStats | null>(null);

  useEffect(() => {
    void reverseRacingStatsRepo.getStats().then(setStats);
  }, []);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinRoom(joinCode.trim().toUpperCase());
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-deck-900 via-deck-850 to-deck-950 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            <span>High-Octane Asymmetrical Racer</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-deck-100 sm:text-4xl">
            Reverse Racing
          </h1>

          <p className="text-sm leading-relaxed text-deck-300 sm:text-base">
            Drive at breakneck speeds while simultaneously sabotaging your rivals! Every player
            races down a designated track while deploying deadly roadblocks, oil slicks, and speed
            bumps onto their circular target&apos;s circuit.
          </p>
        </div>
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Solo Arcade */}
        <Card className="border-deck-border bg-deck-900/90 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-deck-100">Solo Arcade</CardTitle>
                <CardDescription className="text-xs text-deck-400">
                  Race against adaptive AI drivers and test your sabotage reflexes
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-deck-400">
                Opponent AI Competitors: {botCount}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((count) => (
                  <Button
                    key={count}
                    size="sm"
                    variant={botCount === count ? 'primary' : 'outline'}
                    onClick={() => setBotCount(count)}
                    className={
                      botCount === count
                        ? 'bg-sky-500 font-bold text-deck-950 hover:bg-sky-400'
                        : ''
                    }
                  >
                    {count} Bot{count > 1 ? 's' : ''}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-sky-500 font-bold text-deck-950 hover:bg-sky-400"
              onClick={() => onStartSolo(botCount)}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Solo Grand Prix
            </Button>
          </CardContent>
        </Card>

        {/* Online Multiplayer */}
        <Card className="border-deck-border bg-deck-900/90 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-deck-100">
                  Online Multiplayer
                </CardTitle>
                <CardDescription className="text-xs text-deck-400">
                  2–6 Players • Circular Sabotage Chain • Real-time Voice Chat
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              className="w-full bg-amber-500 font-bold text-deck-950 hover:bg-amber-400"
              onClick={onCreateRoom}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Private Room
            </Button>

            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <Input
                placeholder="ROOM CODE"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="font-mono uppercase"
              />
              <Button type="submit" variant="outline" disabled={!joinCode.trim()}>
                Join
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Lifetime Stats */}
      {stats && stats.racesCompleted > 0 && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-deck-border bg-deck-900/60 p-4 sm:grid-cols-4">
          <div>
            <div className="text-xs font-semibold text-deck-400">Races Completed</div>
            <div className="font-mono text-xl font-bold text-deck-100">{stats.racesCompleted}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-deck-400">Victories (1st)</div>
            <div className="font-mono text-xl font-bold text-amber-400">{stats.victories}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-deck-400">Crashes Inflicted</div>
            <div className="font-mono text-xl font-bold text-rose-400">
              {stats.crashesInflicted}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-deck-400">Best Finish Time</div>
            <div className="font-mono text-xl font-bold text-emerald-400">
              {stats.bestFinishTimeMs ? `${(stats.bestFinishTimeMs / 1000).toFixed(2)}s` : '—'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
