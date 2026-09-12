'use client';

import { Check, Send, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { useFriendsStore } from '@/stores/friends.store';
import { usePlayerStore } from '@/stores/player.store';

interface InviteToRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  roomCode: string;
}

export function InviteToRoomModal({ isOpen, onClose, gameId, roomCode }: InviteToRoomModalProps) {
  const { player } = usePlayerStore();
  const { friends, sendGameInvite } = useFriendsStore();
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  const handleInvite = async (friendId: string) => {
    if (!player) return;
    const sender = {
      id: player.id,
      name: player.displayName,
      avatar: player.avatar || '🕹️',
    };
    await sendGameInvite(sender, friendId, gameId, roomCode);
    setInvitedIds((prev) => new Set(prev).add(friendId));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Friend to Match">
      <div className="space-y-4">
        <p className="text-xs text-deck-400">
          Invite a friend to join room{' '}
          <span className="font-mono text-amber-400 font-bold">{roomCode}</span>.
        </p>

        {friends.length === 0 ? (
          <div className="py-6 text-center">
            <Users className="w-8 h-8 text-deck-500 mx-auto mb-2" />
            <p className="text-xs text-deck-400">
              No friends found. Add friends first to invite them.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-y-auto">
            {friends.map((friend) => {
              const isInvited = invitedIds.has(friend.id);

              return (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-raised border border-surface-border"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-base border border-surface-border flex items-center justify-center text-base">
                      {friend.avatar}
                    </div>
                    <span className="text-xs font-bold text-deck-100 truncate">
                      {friend.displayName}
                    </span>
                  </div>

                  {isInvited ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      <span>Sent</span>
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs px-2.5 py-1 flex items-center gap-1"
                      onClick={() => handleInvite(friend.id)}
                    >
                      <Send className="w-3 h-3" />
                      <span>Invite</span>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
