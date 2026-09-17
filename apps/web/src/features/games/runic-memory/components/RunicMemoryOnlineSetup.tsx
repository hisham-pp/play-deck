'use client';

import { Check, Copy, Loader2, LogIn, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, TabContent, TabList, Tabs, TabTrigger } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { ShareRoomLink } from '@/features/multiplayer/components/ShareRoomLink';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import type { DifficultyLevel } from '../types/runic-memory.types';

export interface RunicMemoryOnlineSetupProps {
  difficulty: DifficultyLevel;
  onStartMatch: () => void;
}

const BTN_TYPE = 'button';
const STATUS_CONNECTING = 'connecting';

export function RunicMemoryOnlineSetup({
  difficulty: _difficulty,
  onStartMatch,
}: RunicMemoryOnlineSetupProps) {
  const { player } = usePlayerStore();
  const { roomCode, opponent, connectionStatus, errorMessage, createRoom, joinRoomByCode } =
    useMultiplayerStore();

  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [copied, setCopied] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const handleCreateRoom = async () => {
    if (!player) return;
    await createRoom('runic-memory', player);
  };

  const handleCopy = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCode.trim().replace(/\D/g, '');
    if (clean.length !== 6 || !player) return;
    const ok = await joinRoomByCode(clean, player);
    if (ok) {
      onStartMatch();
    }
  };

  return (
    <div className="p-3 rounded-xl bg-surface-base/80 border border-surface-border">
      <Tabs value={tab} onValueChange={(val) => setTab(val as 'create' | 'join')}>
        <TabList className="grid grid-cols-2 w-full mb-3">
          <TabTrigger value="create" className="text-center justify-center py-1.5 text-xs">
            Create Room
          </TabTrigger>
          <TabTrigger value="join" className="text-center justify-center py-1.5 text-xs">
            Join with Code
          </TabTrigger>
        </TabList>

        <TabContent value="create">
          {!roomCode ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <p className="text-xs text-deck-400">
                Generate a 6-digit room code to invite an online challenger to a Runic Memory duel.
              </p>
              <Button
                type={BTN_TYPE}
                variant="primary"
                onClick={handleCreateRoom}
                loading={connectionStatus === STATUS_CONNECTING}
                className="w-full max-w-xs"
              >
                Generate Room Code
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-deck-500">
                  Your 6-Digit Room Code
                </span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="px-6 py-2.5 rounded-xl bg-surface-overlay border border-amber-500/40 text-amber-400 text-3xl font-black font-mono tracking-widest shadow-arcade">
                    {roomCode}
                  </div>
                  <Button
                    type={BTN_TYPE}
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="p-3 h-auto"
                    title="Copy Code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    type={BTN_TYPE}
                    variant="outline"
                    size="sm"
                    onClick={() => setIsInviteOpen(true)}
                    className="p-3 h-auto flex items-center gap-1.5"
                    title="Invite Friend"
                  >
                    <UserPlus className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold hidden sm:inline">Invite</span>
                  </Button>
                </div>
              </div>

              <ShareRoomLink
                gameId="runic-memory"
                gameName="Runic Memory"
                roomCode={roomCode}
                className="max-w-xs text-left"
              />

              <div className="p-3 rounded-lg border border-surface-border bg-surface-overlay/80 w-full max-w-xs flex items-center justify-center gap-2 text-xs">
                {opponent ? (
                  <>
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">
                      Challenger Connected! ({opponent.displayName})
                    </span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span className="text-deck-300">Waiting for opponent to join...</span>
                  </>
                )}
              </div>

              {opponent && (
                <Button
                  type={BTN_TYPE}
                  variant="primary"
                  onClick={onStartMatch}
                  className="w-full max-w-xs"
                >
                  Enter Arena
                </Button>
              )}

              <InviteToRoomModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                gameId="runic-memory"
                roomCode={roomCode}
              />
            </div>
          )}
        </TabContent>

        <TabContent value="join">
          <form
            onSubmit={handleJoinSubmit}
            className="flex flex-col items-center gap-4 py-4 text-center"
          >
            <div className="w-full max-w-xs flex flex-col gap-2">
              <label
                htmlFor="runic-room-code"
                className="text-xs font-semibold uppercase tracking-wider text-deck-500"
              >
                Enter 6-Digit Room Code
              </label>
              <input
                id="runic-room-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="••••••"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-3xl font-mono font-bold tracking-[0.3em] py-2.5 rounded-xl border border-surface-border bg-surface-overlay text-amber-400 focus:outline-none focus:border-amber-500 placeholder-deck-600"
                autoFocus
                disabled={connectionStatus === STATUS_CONNECTING}
              />
              <span className="text-[11px] text-deck-400">
                Enter code from your opponent to join their runic match.
              </span>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 w-full max-w-xs">
                {errorMessage}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={connectionStatus === STATUS_CONNECTING}
              disabled={joinCode.length !== 6 || connectionStatus === STATUS_CONNECTING}
              className="w-full max-w-xs flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Join Match</span>
            </Button>
          </form>
        </TabContent>
      </Tabs>
    </div>
  );
}
