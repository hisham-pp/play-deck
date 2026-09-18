'use client';

import { Bot, Check, Copy, Flag, LogOut, Play, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { MiniGolfVoiceDock } from '@/features/voice/components/MiniGolfVoiceDock';
import {
  MAX_GOLF_SEATS,
  useMiniGolfMultiplayerStore,
  type GolfPlayerSeat,
} from '@/stores/mini-golf-multiplayer.store';
import type { CoursePreset } from '../engine/mini-golf-types';

const GAME_ID = 'mini-golf';
const GAME_NAME = 'Mini Golf';

interface MiniGolfRoomLobbyProps {
  onStartGame: (seats: GolfPlayerSeat[], preset: CoursePreset) => void;
  onLeave: () => void;
}

const PRESET_OPTIONS: { id: CoursePreset; label: string; holes: string; par: string }[] = [
  { id: 'front-9', label: 'Front 9', holes: 'Holes 1–9', par: 'Par 29' },
  { id: 'back-9', label: 'Back 9', holes: 'Holes 10–18', par: 'Par 34' },
  { id: 'full-18', label: 'Full 18 Championship', holes: 'Holes 1–18', par: 'Par 63' },
];

export const MiniGolfRoomLobby: React.FC<MiniGolfRoomLobbyProps> = ({ onStartGame, onLeave }) => {
  const roomCode = useMiniGolfMultiplayerStore((s) => s.roomCode);
  const seats = useMiniGolfMultiplayerStore((s) => s.seats);
  const coursePreset = useMiniGolfMultiplayerStore((s) => s.coursePreset);
  const setCoursePreset = useMiniGolfMultiplayerStore((s) => s.setCoursePreset);
  const error = useMiniGolfMultiplayerStore((s) => s.error);
  const addBot = useMiniGolfMultiplayerStore((s) => s.addBot);
  const removeBot = useMiniGolfMultiplayerStore((s) => s.removeBot);
  const isHost = useMiniGolfMultiplayerStore((s) => s.isHost());

  const [copied, setCopied] = useState(false);

  const canStart = seats.length >= 1;

  const handleCopyCode = () => {
    if (!roomCode) return;
    void navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl w-full space-y-5 p-2 sm:p-4 text-white">
      <Card className="border-amber-500/20 bg-slate-900/90 backdrop-blur shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <CardTitle className="text-xl font-black text-slate-100 flex items-center gap-2">
              <span>⛳</span>
              <span>{GAME_NAME} Room</span>
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Share the room code or link to play together (1–{MAX_GOLF_SEATS} players)
            </p>
          </div>
          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-slate-950 border border-slate-700 px-3 py-1 font-mono text-sm font-bold text-amber-400">
                {roomCode}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                aria-label="Copy room code"
                className="text-slate-300 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pt-5">
          {error && (
            <p
              role="alert"
              className="text-xs font-semibold text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50"
            >
              {error}
            </p>
          )}

          {roomCode && <ShareRoomLink gameId={GAME_ID} gameName={GAME_NAME} roomCode={roomCode} />}

          {/* Course Preset Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                Course Selection
              </span>
              {!isHost && (
                <span className="text-[11px] text-slate-500 italic">Host selects course</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESET_OPTIONS.map((opt) => {
                const isSelected = coursePreset === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={!isHost}
                    onClick={() => setCoursePreset(opt.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    } ${!isHost ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="text-xs font-bold text-slate-200">{opt.label}</div>
                    <div className="text-[11px] text-slate-400">{opt.holes}</div>
                    <div className="text-[10px] text-amber-400 font-mono mt-0.5">{opt.par}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Players Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Players ({seats.length}/{MAX_GOLF_SEATS})
              </span>
              {isHost && seats.length < MAX_GOLF_SEATS && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addBot}
                  className="h-7 text-xs border-slate-700 text-slate-300 hover:text-white"
                >
                  <Bot className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  Add AI Bot
                </Button>
              )}
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {seats.map((seat) => (
                <li
                  key={seat.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Player Ball Color & Glyph Ring */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0 border-2"
                      style={{
                        backgroundColor: seat.color,
                        borderColor: '#ffffff',
                        color: '#0f172a',
                      }}
                      title={`Ball Glyph: ${seat.glyph}`}
                    >
                      {seat.glyph === 'circle' && '●'}
                      {seat.glyph === 'diamond' && '◆'}
                      {seat.glyph === 'star' && '★'}
                      {seat.glyph === 'triangle' && '▲'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold truncate text-slate-200">
                          {seat.displayName}
                        </span>
                        {seat.isHost && (
                          <Badge
                            size="sm"
                            variant="outline"
                            className="border-amber-500/40 text-amber-300 text-[10px] px-1.5 py-0"
                          >
                            Host
                          </Badge>
                        )}
                        {seat.isAi && (
                          <Badge
                            size="sm"
                            variant="outline"
                            className="border-cyan-500/40 text-cyan-300 text-[10px] px-1.5 py-0"
                          >
                            Bot
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Seat {seat.seatIndex + 1}
                      </span>
                    </div>
                  </div>

                  {isHost && seat.isAi && (
                    <button
                      type="button"
                      onClick={() => removeBot(seat.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      aria-label={`Remove ${seat.displayName}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Voice Chat Dock in Lobby */}
          <div className="pt-2">
            <MiniGolfVoiceDock anchorClassName="!static !w-full" />
          </div>

          {/* Lobby Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              className="border-slate-800 text-slate-400 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Leave
            </Button>

            {isHost ? (
              <Button
                variant="primary"
                disabled={!canStart}
                onClick={() => onStartGame(seats, coursePreset)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5"
              >
                <Play className="w-4 h-4 mr-1.5" />
                Start Match
              </Button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Waiting for the host to tee off…
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
