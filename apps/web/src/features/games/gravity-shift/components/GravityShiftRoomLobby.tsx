'use client';

import { Check, Copy, LogOut, PlayCircle, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { GravityShiftVoiceDock } from '@/features/voice/components/GravityShiftVoiceDock';
import {
  MAX_PLAYERS,
  MIN_PLAYERS,
  useGravityShiftMultiplayerStore,
} from '@/stores/gravity-shift-multiplayer.store';
import { GRAVITY_COURSES } from '../engine/course-catalog';

export interface GravityShiftRoomLobbyProps {
  onStartRace: () => void;
  onLeave: () => void;
}

export function GravityShiftRoomLobby({ onStartRace, onLeave }: GravityShiftRoomLobbyProps) {
  const roomCode = useGravityShiftMultiplayerStore((s) => s.roomCode);
  const players = useGravityShiftMultiplayerStore((s) => s.players);
  const selectedCourseId = useGravityShiftMultiplayerStore((s) => s.selectedCourseId);
  const selectCourse = useGravityShiftMultiplayerStore((s) => s.selectCourse);
  const isHost = useGravityShiftMultiplayerStore((s) => s.isHost());
  const addBot = useGravityShiftMultiplayerStore((s) => s.addBot);
  const removeBot = useGravityShiftMultiplayerStore((s) => s.removeBot);
  const transport = useGravityShiftMultiplayerStore((s) => s.transport);

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    void navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = isHost && players.length >= MIN_PLAYERS;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <Card className="border-amber-500/30 bg-[#111827] shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#232f45] pb-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="text-2xl">🌀</span> Gravity Shift Paddock
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Multiplayer 4-way gravity inverting race ({MIN_PLAYERS}–{MAX_PLAYERS} racers). Any
              racer can invert gravity for everyone!
            </p>
          </div>

          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-[#1c2438] px-3 py-1.5 font-mono text-sm font-bold text-amber-400 border border-[#232f45]">
                {roomCode}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                aria-label="Copy room code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Share Link and Voice Dock */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#1c2438] rounded-xl border border-[#232f45]">
            <div className="flex-1 min-w-[240px]">
              {roomCode && (
                <ShareRoomLink
                  gameId="gravity-shift"
                  roomCode={roomCode}
                  gameName="Gravity Shift"
                />
              )}
            </div>
            {roomCode && <GravityShiftVoiceDock roomCode={roomCode} transport={transport} />}
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Orbital Course:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {GRAVITY_COURSES.map((course) => (
                <button
                  key={course.id}
                  disabled={!isHost}
                  onClick={() => selectCourse(course.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    selectedCourseId === course.id
                      ? 'border-amber-400 bg-amber-950/30 shadow-md'
                      : 'border-[#232f45] bg-[#1c2438] hover:border-slate-600'
                  } ${!isHost ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="font-bold text-slate-200 text-sm">{course.name}</div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {course.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Racer Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                Racers ({players.length} / {MAX_PLAYERS})
              </h3>

              {isHost && players.length < MAX_PLAYERS && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addBot}
                  className="text-xs text-amber-400 border-amber-400/40 hover:bg-amber-400/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add AI Racer
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1c2438] border border-[#232f45]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/50"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-base">{p.avatar}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                        {p.name}
                        {p.isHost && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                            Host
                          </span>
                        )}
                        {p.isBot && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Bot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isHost && p.isBot && (
                    <button
                      onClick={() => removeBot(p.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove Bot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#232f45]">
            <Button variant="ghost" onClick={onLeave} className="text-slate-400">
              <LogOut className="w-4 h-4 mr-1.5" />
              Leave Room
            </Button>

            {isHost ? (
              <Button
                disabled={!canStart}
                onClick={onStartRace}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 shadow-lg shadow-amber-500/20"
              >
                <PlayCircle className="w-5 h-5 mr-1.5" />
                Launch Race
              </Button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Waiting for host to launch the race...
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
