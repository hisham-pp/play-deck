'use client';

import { Check, Copy, Loader2, LogIn, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, TabContent, TabList, Tabs, TabTrigger } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

export interface ConnectFourOnlineSetupProps {
  onStartMatch: () => void;
}

const BTN_TYPE = 'button';

interface CreateRoomSectionProps {
  roomCode: string | null;
  hasOpponent: boolean;
  isLoading: boolean;
  onCreate: () => Promise<void>;
  onStartGame: () => void;
}

function CreateRoomSection({
  roomCode,
  hasOpponent,
  isLoading,
  onCreate,
  onStartGame,
}: CreateRoomSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const handleCopy = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!roomCode) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <p className="text-xs text-deck-400">
          Generate a 6-digit room code to invite an online challenger to Connect Four.
        </p>
        <Button
          type={BTN_TYPE}
          variant="primary"
          onClick={onCreate}
          loading={isLoading}
          className="w-full max-w-xs"
        >
          Generate Room Code
        </Button>
      </div>
    );
  }

  return (
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
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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

      <div className="p-3 rounded-lg border border-surface-border bg-surface-overlay/80 w-full max-w-xs flex items-center justify-center gap-2 text-xs">
        {hasOpponent ? (
          <>
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Opponent Connected! (You: Red)</span>
          </>
        ) : (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span className="text-deck-300">Waiting for opponent to join...</span>
          </>
        )}
      </div>

      {hasOpponent && (
        <Button type={BTN_TYPE} variant="primary" onClick={onStartGame} className="w-full max-w-xs">
          Start Match
        </Button>
      )}

      <InviteToRoomModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        gameId="connect-four"
        roomCode={roomCode}
      />
    </div>
  );
}

interface JoinRoomSectionProps {
  isLoading: boolean;
  errorMessage: string | null;
  onJoin: (code: string) => Promise<void>;
}

function JoinRoomSection({ isLoading, errorMessage, onJoin }: JoinRoomSectionProps) {
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().replace(/\D/g, '');
    if (clean.length !== 6) return;
    await onJoin(clean);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="w-full max-w-xs flex flex-col gap-2">
        <label
          htmlFor="connect-four-room-code"
          className="text-xs font-semibold uppercase tracking-wider text-deck-500"
        >
          Enter 6-Digit Room Code
        </label>
        <input
          id="connect-four-room-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={handleInputChange}
          className="w-full text-center text-3xl font-mono font-bold tracking-[0.3em] py-2.5 rounded-xl border border-surface-border bg-surface-overlay text-amber-400 focus:outline-none focus:border-amber-500 placeholder-deck-600"
          autoFocus
          disabled={isLoading}
        />
        <span className="text-[11px] text-deck-400">
          Enter code from your opponent (You play Yellow / Second).
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
        loading={isLoading}
        disabled={code.length !== 6 || isLoading}
        className="w-full max-w-xs flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        <span>Join Match</span>
      </Button>
    </form>
  );
}

export function ConnectFourOnlineSetup({ onStartMatch }: ConnectFourOnlineSetupProps) {
  const { player } = usePlayerStore();
  const { roomCode, opponent, connectionStatus, errorMessage, createRoom, joinRoomByCode } =
    useMultiplayerStore();

  const [tab, setTab] = useState<'create' | 'join'>('create');

  const handleCreateRoom = async () => {
    if (!player) return;
    await createRoom('connect-four', player);
  };

  const handleJoinRoom = async (code: string) => {
    if (!player) return;
    const ok = await joinRoomByCode(code, player);
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
          <CreateRoomSection
            roomCode={roomCode}
            hasOpponent={Boolean(opponent)}
            isLoading={connectionStatus === 'connecting'}
            onCreate={handleCreateRoom}
            onStartGame={onStartMatch}
          />
        </TabContent>

        <TabContent value="join">
          <JoinRoomSection
            isLoading={connectionStatus === 'connecting'}
            errorMessage={errorMessage}
            onJoin={handleJoinRoom}
          />
        </TabContent>
      </Tabs>
    </div>
  );
}
