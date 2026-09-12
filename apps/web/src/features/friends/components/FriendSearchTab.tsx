'use client';

import { Clock, Search, UserCheck, UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { useFriendsStore } from '@/stores/friends.store';
import { usePlayerStore } from '@/stores/player.store';

export function FriendSearchTab() {
  const [emailInput, setEmailInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const { player, setAuthModalOpen } = usePlayerStore();
  const { searchResults, isSearching, searchEmail, sendRequest, friends, outgoingRequests } =
    useFriendsStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!player) return;
    searchEmail(emailInput, player.id);
  };

  const handleSendRequest = async (targetId: string) => {
    if (!player) return;
    const res = await sendRequest(player.id, targetId);
    if (!res.success) {
      setFeedback(res.error || 'Failed to send request');
    } else {
      setFeedback('Friend request sent!');
    }
  };

  if (player?.isGuest) {
    return (
      <div className="py-8 px-4 text-center">
        <p className="text-xs text-deck-400 mb-3">
          Sign in or create an account to search for friends by email and save your friends list.
        </p>
        <Button variant="primary" size="sm" onClick={() => setAuthModalOpen(true)}>
          Sign In / Register
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-deck-400" />
          <input
            type="email"
            placeholder="Search by player email..."
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              if (feedback) setFeedback(null);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-base border border-surface-border focus:outline-none focus:border-amber-500 text-deck-100 placeholder:text-deck-500"
          />
        </div>
        <Button type="submit" variant="primary" size="sm" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {feedback && (
        <div className="text-xs text-center py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
          {feedback}
        </div>
      )}

      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {searchResults.map((user) => {
          const isAlreadyFriend = friends.some((f) => f.id === user.id);
          const isPending = outgoingRequests.some((r) => r.friendId === user.id);

          return (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-surface-border"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-surface-base border border-surface-border flex items-center justify-center text-lg">
                  {user.avatar}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-deck-100 truncate">
                    {user.displayName}
                  </span>
                  <span className="text-[11px] text-deck-400 truncate">{user.email}</span>
                </div>
              </div>

              {isAlreadyFriend ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-1 bg-emerald-500/10 rounded-lg">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Friends</span>
                </span>
              ) : isPending ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold px-2 py-1 bg-amber-500/10 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending</span>
                </span>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs px-2.5 py-1 flex items-center gap-1"
                  onClick={() => handleSendRequest(user.id)}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
