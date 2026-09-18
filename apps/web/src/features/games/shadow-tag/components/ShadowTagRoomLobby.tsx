'use client';

import { Bot, Check, Copy, LogOut, Play, Plus, Trash2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { ShadowTagVoiceDock } from '@/features/voice/components/ShadowTagVoiceDock';
import { useShadowTagMultiplayerStore } from '@/stores/shadow-tag-multiplayer.store';
import { MAX_SEATS, MIN_SEATS } from '../engine/shadow-tag-constants';

interface ShadowTagRoomLobbyProps {
  onStartGame: () => void;
  onLeave: () => void;
}

export function ShadowTagRoomLobby({ onStartGame, onLeave }: ShadowTagRoomLobbyProps) {
  const { roomCode, isHost, seats, addBot, removeBot, setStatus, leaveRoom } =
    useShadowTagMultiplayerStore();

  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    leaveRoom();
    onLeave();
  };

  const handleStart = () => {
    if (!isHost()) return;
    setStatus('playing');
    onStartGame();
  };

  const canStart = isHost() && seats.length >= MIN_SEATS;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4">
      <Card className="border-[#1e293b] bg-[#0b101d]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black text-white">
              <span>Shadow Tag Room</span>
              <Badge variant="outline" className="border-amber-500/30 text-xs text-amber-400">
                2–6 Players
              </Badge>
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Duck into moving shadows, avoid the flashlights, and tag your opponents in the dark!
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLeave}
            className="gap-1.5 text-slate-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave</span>
          </Button>
        </CardHeader>

        <CardContent className="flex flex-col items-stretch justify-between gap-4 border-t border-[#1e293b] pt-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Room Code:
            </span>
            <div className="flex items-center gap-1.5 rounded-lg border border-[#1e2a44] bg-[#111a2e] px-3 py-1">
              <span className="font-mono text-lg font-black tracking-widest text-amber-400">
                {roomCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1 text-slate-400 transition-colors hover:text-white"
                title="Copy Room Code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {roomCode && <ShareRoomLink roomCode={roomCode} gameId="shadow-tag" />}
        </CardContent>
      </Card>

      <ShadowTagVoiceDock />

      <Card className="border-[#1e293b] bg-[#0b101d]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
              <Users className="h-4 w-4 text-amber-400" />
              <span>
                Players in Room ({seats.length}/{MAX_SEATS})
              </span>
            </CardTitle>

            {isHost() && seats.length < MAX_SEATS && (
              <Button
                variant="outline"
                size="sm"
                onClick={addBot}
                className="gap-1.5 text-xs text-slate-300"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add AI Shadow</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {seats.map((seat) => (
              <div
                key={seat.id}
                className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-overlay p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{
                      backgroundColor: `${seat.color}20`,
                      borderColor: seat.color,
                      borderWidth: 1,
                    }}
                  >
                    {seat.avatar || (seat.type === 'bot' ? '🤖' : '👤')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-100">
                      <span className="text-sm">{seat.displayName}</span>
                      {seat.type === 'bot' && (
                        <Bot className="h-3 w-3 text-slate-400" aria-hidden="true" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">Seat #{seat.seatIndex + 1}</span>
                  </div>
                </div>

                {isHost() && seat.type === 'bot' && (
                  <button
                    type="button"
                    onClick={() => removeBot(seat.id)}
                    className="rounded p-1 text-slate-400 transition-colors hover:text-red-400"
                    title="Remove Bot"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-[#1e293b] pt-4 sm:flex-row">
            <span className="text-xs text-slate-400">
              {seats.length < MIN_SEATS
                ? `Need at least ${MIN_SEATS} players to start (add AI bots or invite friends).`
                : 'Ready to enter the dark arena.'}
            </span>

            {isHost() ? (
              <Button
                disabled={!canStart}
                onClick={handleStart}
                className="w-full gap-2 font-bold sm:w-auto"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Start Shadow Tag</span>
              </Button>
            ) : (
              <span className="text-sm italic text-slate-400">
                Waiting for the host to start the round…
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
