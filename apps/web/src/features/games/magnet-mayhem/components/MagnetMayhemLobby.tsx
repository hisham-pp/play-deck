'use client';

import { ArrowRight, Bot, Magnet, Play, ShieldAlert, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@playdeck/ui';
import { magnetStatsRepository, type MagnetMayhemStats } from '../services/magnet-stats-repository';

export interface MagnetMayhemLobbyProps {
  onStartSolo: (botCount: number) => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string) => void;
  isJoining?: boolean;
}

export function MagnetMayhemLobby({
  onStartSolo,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  isJoining = false,
}: MagnetMayhemLobbyProps) {
  const [botCount, setBotCount] = useState(3);
  const [joinCode, setJoinCode] = useState('');
  const [stats, setStats] = useState<MagnetMayhemStats | null>(null);

  useEffect(() => {
    magnetStatsRepository.getStats().then(setStats);
  }, []);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      onJoinOnlineRoom(joinCode.trim().toUpperCase());
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Title Hero */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-400 mb-2">
          <Magnet className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          Magnetic Attract & Repel Physics Arena
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400">
          Magnet Mayhem
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Control high-powered magnets! Sling yourself across metallic anchors, blast opponents into
          hazard coils, and collect glowing target orbs for high scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Rules & Solo vs AI */}
        <div className="md:col-span-2 space-y-6">
          {/* Rules Card */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Arena Mechanics
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="font-bold text-cyan-400 mb-1">1. Attract & Slingshot</div>
                <p className="text-slate-400">
                  Left-click or Space pulls you toward metallic anchors. Sling with momentum to
                  rocket across the arena.
                </p>
              </div>
              <div className="p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="font-bold text-rose-400 mb-1">2. Repel Shockwave</div>
                <p className="text-slate-400">
                  Right-click or Shift emits a repulsive pulse. Deny rivals targets and blast them
                  into Tesla Coils!
                </p>
              </div>
              <div className="p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="font-bold text-amber-400 mb-1">3. Target Orbs</div>
                <p className="text-slate-400">
                  Collect Cyan (10 pts), Gold (25 pts), and Star (50 pts) orbs. Highest score when
                  timer expires wins!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Solo vs AI */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center justify-between">
                <span>Play vs Bots</span>
                <span className="text-xs font-normal text-slate-400">Instant offline match</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">AI Rivals</div>
                    <div className="text-xs text-slate-400">
                      Physics-driven bot magnets that sling and repel
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((count) => (
                    <button
                      key={count}
                      onClick={() => setBotCount(count)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        botCount === count
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
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
                className="w-full bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-5 text-base shadow-lg shadow-cyan-500/20"
              >
                <Play className="w-5 h-5 mr-2" />
                Launch Arena ({botCount + 1} Players)
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Multiplayer & Career Stats */}
        <div className="space-y-6">
          {/* Online Multiplayer Card */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Online Arena Room
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={onCreateOnlineRoom}
                className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 font-semibold"
              >
                Create Online Room
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

          {/* Stats Card */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Pilot Career
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
                <span className="text-slate-400">High Score</span>
                <span className="font-bold text-amber-400">{stats?.highScore ?? 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Total Targets</span>
                <span className="font-bold text-cyan-400">{stats?.targetsCollected ?? 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Slingshots Made</span>
                <span className="font-bold text-purple-400">{stats?.slingshots ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
