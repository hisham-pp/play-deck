'use client';

import { Check, Copy, Headset, LogOut, PlayCircle, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { BombFactoryVoiceDock } from '@/features/voice/components/BombFactoryVoiceDock';
import { useBombFactoryMultiplayerStore } from '@/stores/bomb-factory-multiplayer.store';
import {
  DEFAULT_DIFFICULTY,
  GAME_ID,
  MAX_SEATS,
  MIN_SEATS,
} from '../engine/bomb-factory-constants';
import type { BombFactoryDifficulty, BombFactorySeat } from '../types/bomb-factory.types';
import { BombFactoryDifficultyPicker } from './BombFactoryDifficultyPicker';

const GAME_NAME = 'Bomb Factory';

interface BombFactoryRoomLobbyProps {
  onStartShift: (seats: BombFactorySeat[], difficulty: BombFactoryDifficulty) => void;
  onLeave: () => void;
}

export function BombFactoryRoomLobby({ onStartShift, onLeave }: BombFactoryRoomLobbyProps) {
  const roomCode = useBombFactoryMultiplayerStore((s) => s.roomCode);
  const seats = useBombFactoryMultiplayerStore((s) => s.seats);
  const error = useBombFactoryMultiplayerStore((s) => s.error);
  const leaveRoom = useBombFactoryMultiplayerStore((s) => s.leaveRoom);
  const isHost = useBombFactoryMultiplayerStore((s) => s.isHost());

  const [difficulty, setDifficulty] = useState<BombFactoryDifficulty>(DEFAULT_DIFFICULTY);
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!roomCode) return;
    void navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Card className="border-amber-500/20 bg-surface-raised">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-deck-100">🧨 {GAME_NAME} Room</CardTitle>
            <p className="mt-1 text-xs text-deck-400">
              Fill the floor with {MIN_SEATS}–{MAX_SEATS} operators. Everyone gets a different
              sheet.
            </p>
          </div>
          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded bg-surface-overlay px-3 py-1 font-mono text-sm font-bold text-amber-400">
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

        <CardContent className="space-y-5">
          {error && (
            <p role="alert" className="text-sm font-medium text-rose-400">
              {error}
            </p>
          )}

          <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-100">
            <Headset className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Voice is not optional here. No operator can see the whole blueprint, so join the dock in
            the corner before the clock starts.
          </p>

          {roomCode && isHost && (
            <ShareRoomLink gameId={GAME_ID} gameName={GAME_NAME} roomCode={roomCode} />
          )}

          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {seats.map((seat) => (
              <li
                key={seat.id}
                className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-overlay p-3"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span aria-hidden="true" className="text-lg leading-none">
                    {seat.avatar}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-deck-200">
                      {seat.displayName}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wide text-deck-500">
                      Station {seat.seatIndex + 1}
                    </span>
                  </span>
                </span>
                <Badge variant="default">{seat.seatIndex === 0 ? 'Lead' : 'Ready'}</Badge>
              </li>
            ))}
          </ul>

          {isHost ? (
            <BombFactoryDifficultyPicker value={difficulty} onChange={setDifficulty} />
          ) : (
            <p className="text-center text-xs text-deck-500">
              Waiting for the shift lead to deal the sheets…
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                leaveRoom();
                onLeave();
              }}
              className="text-deck-400"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden="true" /> Leave
            </Button>

            {isHost && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowInvite(true)}>
                  <UserPlus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Invite
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onStartShift(seats, difficulty)}
                  disabled={seats.length < MIN_SEATS}
                  className="font-black uppercase"
                >
                  <PlayCircle className="mr-1.5 h-4 w-4" aria-hidden="true" /> Deal the sheets
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warm the mesh up while the floor fills, so nobody is muted at step one. */}
      <BombFactoryVoiceDock anchorClassName="bottom-4 right-4" />

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
