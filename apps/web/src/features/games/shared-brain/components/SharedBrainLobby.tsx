'use client';

import { Bot, Brain, Compass, Gamepad2, Play, Plus, Users } from 'lucide-react';
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
  SharedBrainStatsRepository,
  type SharedBrainStats,
} from '../services/shared-brain-stats-repository';

export type SoloPlayMode = 'both' | 'navigator_with_bot' | 'motor_with_bot';

interface SharedBrainLobbyProps {
  onStartSolo: (mode: SoloPlayMode) => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string) => void;
}

export function SharedBrainLobby({ onStartSolo, onCreateRoom, onJoinRoom }: SharedBrainLobbyProps) {
  const [soloMode, setSoloMode] = useState<SoloPlayMode>('both');
  const [joinCode, setJoinCode] = useState('');
  const [stats, setStats] = useState<SharedBrainStats | null>(null);

  useEffect(() => {
    void SharedBrainStatsRepository.getStats().then(setStats);
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
      <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-gradient-to-br from-deck-900 via-deck-850 to-deck-950 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Brain className="h-3.5 w-3.5" />
            <span>Cooperative Dual-Hemisphere Platformer</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-deck-100 sm:text-4xl">
            Shared Brain
          </h1>

          <p className="text-sm leading-relaxed text-deck-300 sm:text-base">
            Two players, one avatar! The <strong>Navigator</strong> steers horizontal movement while
            the <strong>Motor</strong> controls jumps, levers, and mechanism triggers. Synchronize
            your actions or stumble into the synaptic abyss!
          </p>
        </div>
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Solo / Bot Arcade */}
        <Card className="border-deck-border bg-deck-900/90 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-deck-100">Solo Training</CardTitle>
                <CardDescription className="text-xs text-deck-400">
                  Master dual-hemisphere coordination solo or pair with an AI Buddy Bot
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-deck-400">
                Play Mode
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setSoloMode('both')}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                    soloMode === 'both'
                      ? 'border-sky-500 bg-sky-500/10 text-deck-100'
                      : 'border-deck-border bg-deck-800/60 text-deck-300 hover:bg-deck-800'
                  }`}
                >
                  <Brain className="h-5 w-5 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold">Dual-Control Solo</div>
                    <div className="text-[11px] text-deck-400">
                      Control both Navigator & Motor hemispheres
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSoloMode('navigator_with_bot')}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                    soloMode === 'navigator_with_bot'
                      ? 'border-sky-500 bg-sky-500/10 text-deck-100'
                      : 'border-deck-border bg-deck-800/60 text-deck-300 hover:bg-deck-800'
                  }`}
                >
                  <Compass className="h-5 w-5 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold">You Navigate + Bot Motors</div>
                    <div className="text-[11px] text-deck-400">
                      You steer horizontal movement; Bot auto-jumps chasms
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSoloMode('motor_with_bot')}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                    soloMode === 'motor_with_bot'
                      ? 'border-amber-500 bg-amber-500/10 text-deck-100'
                      : 'border-deck-border bg-deck-800/60 text-deck-300 hover:bg-deck-800'
                  }`}
                >
                  <Gamepad2 className="h-5 w-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold">You Motor + Bot Navigates</div>
                    <div className="text-[11px] text-deck-400">
                      Bot steers forward; you time jumps and trigger levers
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <Button
              className="w-full bg-sky-500 font-bold text-deck-950 hover:bg-sky-400"
              onClick={() => onStartSolo(soloMode)}
            >
              <Play className="mr-2 h-4 w-4" /> Start Course Run
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
                  Co-op & Race Lobby
                </CardTitle>
                <CardDescription className="text-xs text-deck-400">
                  2–6 Players • 2-Player Co-op or Multi-Team Race • Real-time Voice Chat
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              className="w-full bg-amber-500 font-bold text-deck-950 hover:bg-amber-400"
              onClick={onCreateRoom}
            >
              <Plus className="mr-2 h-4 w-4" /> Create Private Room
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

            <div className="rounded-lg border border-deck-border bg-deck-850 p-3 text-xs text-deck-400">
              <span className="font-semibold text-deck-200">Voice Essential:</span> Use the
              integrated WebRTC audio dock to coordinate jump calls (&ldquo;jump now!&rdquo;) in
              real-time!
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lifetime Stats */}
      {stats && stats.coursesCompleted > 0 && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-deck-border bg-deck-900/60 p-4 sm:grid-cols-3">
          <div>
            <div className="text-xs font-semibold text-deck-400">Courses Completed</div>
            <div className="font-mono text-xl font-bold text-deck-100">
              {stats.coursesCompleted}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-deck-400">Total Brain Tokens</div>
            <div className="font-mono text-xl font-bold text-amber-400">{stats.totalTokens}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-deck-400">Best Speedrun Record</div>
            <div className="font-mono text-xl font-bold text-emerald-400">
              {stats.bestCourseTimes?.['synaptic-gap']
                ? `${(stats.bestCourseTimes['synaptic-gap'] / 1000).toFixed(2)}s`
                : '—'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
