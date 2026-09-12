'use client';

import { Gamepad2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Button, IconButton } from '@/components/ui';
import { useFriendsStore } from '@/stores/friends.store';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';

export function GameInviteToast() {
  const router = useRouter();
  const { player } = usePlayerStore();
  const { pendingInvites, dismissInvite } = useFriendsStore();
  const { joinRoomByCode } = useMultiplayerStore();

  const activeInvite = pendingInvites[0];
  if (!activeInvite) return null;

  const handleJoin = async () => {
    dismissInvite(activeInvite.id);
    if (player) {
      await joinRoomByCode(activeInvite.roomCode, player);
    }
    router.push(`/play/${activeInvite.gameId}?room=${activeInvite.roomCode}`);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-surface-raised border-2 border-amber-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl p-4 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Gamepad2 className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
            Game Invitation
          </h5>
          <p className="text-xs text-deck-200 mt-0.5">
            <span className="font-semibold text-white">{activeInvite.senderName}</span> invited you
            to play{' '}
            <span className="text-amber-400 font-mono font-semibold">{activeInvite.gameId}</span>!
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="primary"
              size="sm"
              className="text-xs px-3 py-1 font-bold"
              onClick={handleJoin}
            >
              Join Match
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-deck-400 hover:text-deck-100"
              onClick={() => dismissInvite(activeInvite.id)}
            >
              Decline
            </Button>
          </div>
        </div>

        <IconButton
          aria-label="Dismiss Invite"
          variant="ghost"
          size="sm"
          className="text-deck-500 hover:text-deck-200 shrink-0"
          onClick={() => dismissInvite(activeInvite.id)}
        >
          <X className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  );
}
