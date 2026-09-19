'use client';

import { ArrowRight, Bot, Play, Trophy, Users, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@playdeck/ui';
import { GRAVITY_COURSES } from '../engine/course-catalog';
import {
  gravityShiftStatsRepository,
  type GravityShiftStats,
} from '../services/gravity-shift-stats-repository';

export interface GravityShiftLobbyProps {
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  onStartSolo: (botCount: number) => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string) => void;
  isJoining?: boolean;
}

export function GravityShiftLobby({
  selectedCourseId,
  onSelectCourse,
  onStartSolo,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  isJoining = false,
}: GravityShiftLobbyProps) {
  const [botCount, setBotCount] = useState(2);
  const [joinCode, setJoinCode] = useState('');
  const [stats, setStats] = useState<GravityShiftStats | null>(null);

  useEffect(() => {
    gravityShiftStatsRepository.getStats().then(setStats);
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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-emerald-400">
          Gravity Shift
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          High-velocity 4-way gravity racing. Shift walls into floors and leap across hyperspace
          tracks to outpace your opponents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Course Selection */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200">1. Select Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {GRAVITY_COURSES.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => onSelectCourse(course.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedCourseId === course.id
                        ? 'border-amber-400 bg-amber-950/20 shadow-md'
                        : 'border-[#232f45] bg-[#1c2438] hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-slate-200 text-sm">{course.name}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {course.description}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Solo / Bot Race Controls */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center justify-between">
                <span>2. Solo vs AI Racers</span>
                <span className="text-xs font-normal text-slate-400">Instant offline play</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#1c2438] rounded-xl border border-[#232f45]">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-sm font-semibold text-slate-200">AI Opponents</div>
                    <div className="text-xs text-slate-400">
                      Race against autonomous gravity-shifting bots
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
                          ? 'bg-amber-500 text-slate-950 shadow-md'
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
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-5 text-base shadow-lg shadow-amber-500/20"
              >
                <Play className="w-5 h-5 mr-2" />
                Launch Solo Race
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
                <Users className="w-4 h-4 text-cyan-400" />
                Online Multiplayer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={onCreateOnlineRoom}
                className="w-full border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 font-semibold"
              >
                Create Room
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
                  variant="secondary"
                  disabled={!joinCode.trim() || isJoining}
                  className="w-full bg-[#1c2438] hover:bg-[#232f45] text-slate-200 border border-[#232f45]"
                >
                  Join Room
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats & Career Highlights */}
          <Card className="border-[#232f45] bg-[#111827]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Career Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Races Completed</span>
                <span className="font-bold text-slate-200">{stats?.racesCompleted ?? 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Victories</span>
                <span className="font-bold text-emerald-400">{stats?.racesWon ?? 0}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#232f45]">
                <span className="text-slate-400">Gravity Shifts Used</span>
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {stats?.totalShiftsTriggered ?? 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
