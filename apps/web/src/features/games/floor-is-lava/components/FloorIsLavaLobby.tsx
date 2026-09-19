'use client';

import { ArrowRight, Bot, Flame, Play, ShieldAlert, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@playdeck/ui';

import {
  floorIsLavaStatsRepository,
  type FloorIsLavaStats,
} from '../services/floor-is-lava-stats-repository';

export interface FloorIsLavaLobbyProps {
  onStartSolo: (botCount: number) => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string) => void;
  isJoining?: boolean;
}

export function FloorIsLavaLobby({
  onStartSolo,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  isJoining = false,
}: FloorIsLavaLobbyProps) {
  const [botCount, setBotCount] = useState(3);
  const [joinCode, setJoinCode] = useState('');
  const [stats, setStats] = useState<FloorIsLavaStats | null>(null);

  useEffect(() => {
    floorIsLavaStatsRepository.getStats().then(setStats);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinOnlineRoom(joinCode.trim().toUpperCase());
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Title Hero */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-xs font-semibold text-red-400 mb-2">
          <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          Disappearing Tile Survival Battle
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400">
          Floor Is Lava
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          The arena collapses beneath your feet! Push opponents into the rising magma, claim
          power-up platforms, and be the last player standing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Game Rules & Solo Play */}
        <div className="md:col-span-2 space-y-6">
          {/* Arena Rules Card */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Survival Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="font-bold text-amber-400 mb-1">1. Outer Collapse</div>
                <p className="text-slate-400">
                  Outer rings sink into molten lava first. Keep moving toward center safe tiles.
                </p>
              </div>
              <div className="p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="font-bold text-orange-400 mb-1">2. Dwell Deterioration</div>
                <p className="text-slate-400">
                  Staying on any tile degrades its stability rapidly. Constant movement is survival.
                </p>
              </div>
              <div className="p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="font-bold text-red-400 mb-1">3. Push & Power-ups</div>
                <p className="text-slate-400">
                  Press Space or Push button to blast rivals away. Collect freeze, double jump, and
                  shield items.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Solo vs AI */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center justify-between">
                <span>Solo vs AI Rivals</span>
                <span className="text-xs font-normal text-slate-400">Instant offline battle</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">AI Competitors</div>
                    <div className="text-xs text-slate-400">
                      Tactical survival bots that push, dodge, and grab items
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map((count) => (
                    <button
                      key={count}
                      onClick={() => setBotCount(count)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        botCount === count
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                          : 'bg-[#111827] text-slate-300 hover:bg-[#232f45]'
                      }`}
                    >
                      {count} {count === 1 ? 'Bot' : 'Bots'}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => onStartSolo(botCount)}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-5 text-base shadow-lg shadow-red-500/20"
              >
                <Play className="w-5 h-5 mr-2" />
                Launch Battle ({botCount + 1} Players)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Multiplayer & Stats */}
        <div className="space-y-6">
          {/* Online Multiplayer Card */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-400" />
                Online Multiplayer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={onCreateOnlineRoom}
                className="w-full border-orange-500/40 text-orange-400 hover:bg-orange-500/10 font-semibold"
              >
                Create Battle Room
              </Button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#232f45]"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase">or join</span>
                <div className="flex-grow border-t border-[#232f45]"></div>
              </div>

              <form onSubmit={handleJoin} className="space-y-2">
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 4-letter code"
                  maxLength={6}
                  className="bg-[#1c2438] border-[#232f45] text-center font-mono tracking-widest text-slate-200"
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={!joinCode.trim() || isJoining}
                  className="w-full bg-[#1c2438] hover:bg-[#232f45] text-slate-200 border border-[#232f45]"
                >
                  Join Room
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats & Highlights */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Career Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Matches Played</span>
                <span className="font-bold text-slate-200">{stats?.matchesPlayed ?? 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Victories</span>
                <span className="font-bold text-emerald-400">{stats?.matchesWon ?? 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Total Rivals Pushed</span>
                <span className="font-bold text-orange-400">{stats?.opponentsPushed ?? 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Longest Survival</span>
                <span className="font-bold text-amber-400">
                  {formatTime(stats?.longestSurvivalSec ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
