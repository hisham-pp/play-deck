'use client';

import { Gamepad2, Trash2, UserX } from 'lucide-react';
import React from 'react';
import { Button, IconButton } from '@/components/ui';
import { useFriendsStore } from '@/stores/friends.store';
import { usePlayerStore } from '@/stores/player.store';

interface FriendListTabProps {
  onInviteFriend?: (friendId: string) => void;
  onSwitchToSearch: () => void;
}

export function FriendListTab({ onInviteFriend, onSwitchToSearch }: FriendListTabProps) {
  const { player } = usePlayerStore();
  const { friends, removeFriend } = useFriendsStore();

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-surface-border flex items-center justify-center text-deck-400 mb-3">
          <UserX className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-deck-200">Your Friends List is Empty</h4>
        <p className="text-xs text-deck-400 max-w-xs mt-1 mb-4">
          Connect with other players by searching for their registered email address.
        </p>
        <Button variant="secondary" size="sm" onClick={onSwitchToSearch}>
          Search Players by Email
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-3 rounded-xl bg-surface-raised/70 border border-surface-border hover:border-amber-500/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-surface-base border border-surface-border flex items-center justify-center text-xl shadow-inner">
                {friend.avatar}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface-base" />
            </div>

            <div className="min-w-0 flex flex-col">
              <span className="text-sm font-bold text-deck-100 truncate">{friend.displayName}</span>
              {friend.email && (
                <span className="text-[11px] text-deck-400 truncate">{friend.email}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onInviteFriend && (
              <Button
                variant="primary"
                size="sm"
                className="text-xs px-2.5 py-1 flex items-center gap-1.5"
                onClick={() => onInviteFriend(friend.id)}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Invite</span>
              </Button>
            )}

            {player && (
              <IconButton
                aria-label="Remove Friend"
                variant="ghost"
                size="sm"
                className="text-deck-500 hover:text-red-400 transition-colors"
                onClick={() => removeFriend(player.id, friend.id)}
              >
                <Trash2 className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
