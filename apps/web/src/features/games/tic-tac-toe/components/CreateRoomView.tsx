'use client';

import { Check, Copy, Loader2, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';

const BTN_TYPE = 'button';

export interface CreateRoomViewProps {
  roomCode: string | null;
  hasOpponent: boolean;
  isLoading: boolean;
  onCreate: () => Promise<void>;
  onStartGame: () => void;
}

export function CreateRoomView({
  roomCode,
  hasOpponent,
  isLoading,
  onCreate,
  onStartGame,
}: CreateRoomViewProps) {
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
          Generate a 6-digit numeric room code and share it with your opponent to play online.
        </p>
        <Button
          type={BTN_TYPE}
          variant="primary"
          onClick={onCreate}
          loading={isLoading}
          className="w-full max-w-xs"
        >
          Generate 6-Digit Room Code
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-deck-500">
          Your 6-Digit Room Code
        </span>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="px-6 py-3 rounded-xl bg-surface-overlay border border-amber-500/40 text-amber-400 text-3xl font-black font-mono tracking-widest shadow-arcade">
            {roomCode}
          </div>
          <Button
            type={BTN_TYPE}
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="p-3.5 h-auto"
            title="Copy Code"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </Button>
          <Button
            type={BTN_TYPE}
            variant="outline"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="p-3.5 h-auto flex items-center gap-1.5"
            title="Invite Friend"
          >
            <UserPlus className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold hidden sm:inline">Invite</span>
          </Button>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-surface-border bg-surface-overlay/80 w-full max-w-xs flex items-center justify-center gap-2 text-xs">
        {hasOpponent ? (
          <>
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Opponent Connected! (You: X)</span>
          </>
        ) : (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span className="text-deck-300">Waiting for opponent to enter code...</span>
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
        gameId="tic-tac-toe"
        roomCode={roomCode}
      />
    </div>
  );
}
