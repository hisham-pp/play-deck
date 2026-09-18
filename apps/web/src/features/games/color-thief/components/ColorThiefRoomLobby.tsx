'use client';

import { Bot, Check, Copy, LogOut, Play, Trash2, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { ColorThiefVoiceDock } from '@/features/voice/components/ColorThiefVoiceDock';
import { useColorThiefMultiplayerStore } from '@/stores/color-thief-multiplayer.store';
import { MAX_SEATS, MIN_SEATS } from '../engine/color-thief-constants';
import type { ColorThiefSeat } from '../types/color-thief.types';
import { paintTheme } from '../utils/color-thief-colors';

const GAME_ID = 'color-thief';
const GAME_NAME = 'Color Thief';
const COPIED_RESET_MS = 2000;

export interface ColorThiefRoomLobbyProps {
  onStartGame: (seats: ColorThiefSeat[]) => void;
  onLeave: () => void;
}

export function ColorThiefRoomLobby({ onStartGame, onLeave }: ColorThiefRoomLobbyProps) {
  const roomCode = useColorThiefMultiplayerStore((s) => s.roomCode);
  const seats = useColorThiefMultiplayerStore((s) => s.seats);
  const error = useColorThiefMultiplayerStore((s) => s.error);
  const addBot = useColorThiefMultiplayerStore((s) => s.addBot);
  const removeBot = useColorThiefMultiplayerStore((s) => s.removeBot);
  const leaveRoom = useColorThiefMultiplayerStore((s) => s.leaveRoom);
  const isHost = useColorThiefMultiplayerStore((s) => s.isHost());

  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    void navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-amber-500/20 bg-slate-900/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100">🎨 {GAME_NAME} Room</CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Share the code or link to fill seats ({MIN_SEATS}–{MAX_SEATS} painters)
            </p>
          </div>
          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-800 px-3 py-1 font-mono text-sm font-bold text-amber-400">
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
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <p role="alert" className="text-sm font-medium text-red-400">
              {error}
            </p>
          )}

          {roomCode && isHost && (
            <ShareRoomLink gameId={GAME_ID} gameName={GAME_NAME} roomCode={roomCode} />
          )}

          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {seats.map((seat) => {
              const theme = paintTheme(seat.color);
              return (
                <li
                  key={seat.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 text-xs font-black"
                      style={{
                        background: theme.hex,
                        borderColor: theme.rimHex,
                        color: theme.rimHex,
                      }}
                      aria-hidden="true"
                    >
                      {theme.glyph}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-200">
                        Seat {seat.seatIndex + 1}: {seat.displayName}
                      </span>
                      <span className="block text-xs uppercase text-slate-400">{theme.label}</span>
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-1">
                    <Badge variant={seat.type === 'bot' ? 'outline' : 'default'}>
                      {seat.type === 'bot' ? 'Bot' : 'Ready'}
                    </Badge>
                    {isHost && seat.type === 'bot' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBot(seat.id)}
                        aria-label={`Remove ${seat.displayName}`}
                      >
                        <Trash2 className="h-4 w-4 text-slate-500" />
                      </Button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          {!isHost && (
            <p className="text-center text-xs text-slate-500">
              Waiting for the host to start the match…
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                leaveRoom();
                onLeave();
              }}
              className="text-slate-400 hover:text-slate-200"
            >
              <LogOut className="mr-2 h-4 w-4" /> Leave
            </Button>

            {isHost && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowInvite(true)}
                  className="border-slate-700"
                >
                  <UserPlus className="mr-1.5 h-4 w-4" /> Invite
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addBot}
                  disabled={seats.length >= MAX_SEATS}
                  className="border-slate-700"
                >
                  <Bot className="mr-1.5 h-4 w-4" /> + Bot
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStartGame(seats)}
                  disabled={seats.length < MIN_SEATS}
                  className="bg-amber-500 font-bold text-slate-950 hover:bg-amber-600"
                >
                  <Play className="mr-1.5 h-4 w-4" /> Start
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warm up voice while seats fill — the negotiating starts before the paint does. */}
      <ColorThiefVoiceDock anchorClassName="bottom-4 right-4" />

      {showInvite && roomCode && (
        <InviteToRoomModal
          isOpen={showInvite}
          roomCode={roomCode}
          gameId={GAME_ID}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
