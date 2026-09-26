'use client';

import { Bot, Check, Copy, LogOut, Play, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { SnakeLadderVoiceDock } from '@/features/voice/components/SnakeLadderVoiceDock';
import { useSnakeLadderMultiplayerStore } from '@/stores/snake-ladder-multiplayer.store';
import { MAX_SEATS, MIN_SEATS } from '../engine/snake-ladder-constants';
import type { SnakeLadderPlayer } from '../types/snake-and-ladder.types';
import { seatColorTheme } from '../utils/snake-ladder-colors';

const GAME_ID = 'snake-and-ladder';
const GAME_NAME = 'Snake & Ladder';

interface SnakeLadderRoomLobbyProps {
  onStartGame: (seats: SnakeLadderPlayer[]) => void;
  onLeave: () => void;
}

export function SnakeLadderRoomLobby({ onStartGame, onLeave }: SnakeLadderRoomLobbyProps) {
  const roomCode = useSnakeLadderMultiplayerStore((s) => s.roomCode);
  const seats = useSnakeLadderMultiplayerStore((s) => s.seats);
  const error = useSnakeLadderMultiplayerStore((s) => s.error);
  const addBot = useSnakeLadderMultiplayerStore((s) => s.addBot);
  const removeBot = useSnakeLadderMultiplayerStore((s) => s.removeBot);
  const leaveRoom = useSnakeLadderMultiplayerStore((s) => s.leaveRoom);
  const isHost = useSnakeLadderMultiplayerStore((s) => s.isHost());

  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const canStart = seats.length >= MIN_SEATS;

  const handleCopyCode = () => {
    if (!roomCode) return;
    void navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-amber-500/20 bg-slate-900/80 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100">🐍 {GAME_NAME} Room</CardTitle>
            <p className="mt-1 text-xs text-slate-400">
              Share the code or link to fill seats ({MIN_SEATS}–{MAX_SEATS} players)
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
              const theme = seatColorTheme(seat.color);
              return (
                <li
                  key={seat.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black"
                      style={{
                        background: theme.hex,
                        borderColor: theme.rimHex,
                        color: theme.rimHex,
                      }}
                      aria-hidden="true"
                    >
                      {theme.symbol}
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
                  disabled={!canStart}
                  className="bg-amber-500 font-bold text-slate-950 hover:bg-amber-600"
                >
                  <Play className="mr-1.5 h-4 w-4" /> Start
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warm up voice while seats fill, so the mesh is live before the first roll. */}
      <SnakeLadderVoiceDock defaultOpen={true} />

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
