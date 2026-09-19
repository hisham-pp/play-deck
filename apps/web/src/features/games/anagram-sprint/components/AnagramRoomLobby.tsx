'use client';

import { Check, Copy, LogOut, Play, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { AnagramVoiceDock } from '@/features/voice/components/AnagramVoiceDock';
import { useAnagramMultiplayerStore } from '@/stores/anagram-multiplayer.store';
import {
  DEFAULT_RULES,
  GAME_ID,
  GAME_NAME,
  MAX_SEATS,
  MIN_SEATS,
  MODE_BLITZ,
  MODE_CLASSIC,
  MODE_SURVIVAL,
  MODE_TEAM,
  TEAM_LABELS,
  roundsForMode,
} from '../engine/anagram-constants';
import type { AnagramMode, AnagramRules, AnagramSeat } from '../types/anagram-sprint.types';
import { AnagramRulesPicker } from './AnagramRulesPicker';

const COPIED_RESET_MS = 2000;
const ROOM_MODES: AnagramMode[] = [MODE_CLASSIC, MODE_SURVIVAL, MODE_BLITZ, MODE_TEAM];

export interface AnagramRoomLobbyProps {
  onStartMatch: (rules: AnagramRules, seats: AnagramSeat[]) => void;
  onLeave: () => void;
}

export function AnagramRoomLobby({ onStartMatch, onLeave }: AnagramRoomLobbyProps) {
  const roomCode = useAnagramMultiplayerStore((store) => store.roomCode);
  const seats = useAnagramMultiplayerStore((store) => store.seats);
  const error = useAnagramMultiplayerStore((store) => store.error);
  const leaveRoom = useAnagramMultiplayerStore((store) => store.leaveRoom);
  const isHost = useAnagramMultiplayerStore((store) => store.isHost());

  const [rules, setRules] = useState<AnagramRules>({
    ...DEFAULT_RULES,
    mode: MODE_CLASSIC,
    totalRounds: roundsForMode(MODE_CLASSIC),
  });
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
      <Card className="border-amber-500/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-display text-xl font-black text-deck-950 dark:text-white">
              🔤 {GAME_NAME} Room
            </CardTitle>
            <p className="mt-1 text-xs text-deck-500">
              Share the code or link to fill seats ({MIN_SEATS}–{MAX_SEATS} racers)
            </p>
          </div>
          {roomCode && (
            <div className="flex items-center gap-2">
              <span className="rounded bg-surface-overlay px-3 py-1 font-mono text-sm font-bold text-amber-500">
                {roomCode}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                aria-label="Copy room code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <p role="alert" className="text-sm font-medium text-rose-500">
              {error}
            </p>
          )}

          {roomCode && isHost && (
            <ShareRoomLink gameId={GAME_ID} gameName={GAME_NAME} roomCode={roomCode} />
          )}

          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {seats.map((seat, index) => (
              <li
                key={seat.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-surface-border bg-surface-raised p-2.5"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden="true" className="text-lg leading-none">
                    {seat.avatar}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-deck-900 dark:text-white">
                      {seat.name}
                    </span>
                    <span className="block text-[10px] uppercase tracking-wider text-deck-500">
                      Seat {index + 1}
                      {rules.mode === MODE_TEAM && ` · ${TEAM_LABELS[seat.team]}`}
                    </span>
                  </span>
                </span>
                <Badge variant="default">Ready</Badge>
              </li>
            ))}
          </ul>

          {isHost ? (
            <div className="border-t border-surface-border pt-4">
              <AnagramRulesPicker rules={rules} modes={ROOM_MODES} onChange={setRules} />
            </div>
          ) : (
            <p className="text-center text-xs text-deck-500">
              Waiting for the host to start the match…
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                leaveRoom();
                onLeave();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Leave
            </Button>

            {isHost && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowInvite(true)}>
                  <UserPlus className="mr-1.5 h-4 w-4" /> Invite
                </Button>
                <Button
                  size="sm"
                  variant="arcade"
                  onClick={() => onStartMatch(rules, seats)}
                  disabled={seats.length < MIN_SEATS}
                >
                  <Play className="mr-1.5 h-4 w-4" /> Start
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warm the mic up while seats fill — the trash talk starts before the words do. */}
      <AnagramVoiceDock anchorClassName="bottom-4 right-4" />

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
