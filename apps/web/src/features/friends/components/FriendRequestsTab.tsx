'use client';

import { Check, Clock, Inbox, X } from 'lucide-react';
import React from 'react';
import { Button, IconButton } from '@/components/ui';
import { useFriendsStore } from '@/stores/friends.store';
import { usePlayerStore } from '@/stores/player.store';

export function FriendRequestsTab() {
  const { player } = usePlayerStore();
  const { incomingRequests, outgoingRequests, acceptRequest, declineRequest } = useFriendsStore();

  const total = incomingRequests.length + outgoingRequests.length;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-surface-border flex items-center justify-center text-deck-400 mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-deck-200">No Pending Requests</h4>
        <p className="text-xs text-deck-400 max-w-xs mt-1">
          Incoming and outgoing friend requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
      {/* Incoming Requests */}
      {incomingRequests.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-amber-400 tracking-wider">
            Received Requests ({incomingRequests.length})
          </span>
          {incomingRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-surface-base border border-surface-border flex items-center justify-center text-lg">
                  {req.friend?.avatar || '🕹️'}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-deck-100 truncate">
                    {req.friend?.displayName || 'Player'}
                  </span>
                  {req.friend?.email && (
                    <span className="text-[10px] text-deck-400 truncate">{req.friend.email}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs px-2.5 py-1 flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500"
                  onClick={() => player && acceptRequest(req.id, player.id)}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept</span>
                </Button>
                <IconButton
                  aria-label="Decline Request"
                  variant="ghost"
                  size="sm"
                  className="text-deck-500 hover:text-red-400"
                  onClick={() => player && declineRequest(req.id, player.id)}
                >
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outgoing Requests */}
      {outgoingRequests.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase font-bold text-deck-400 tracking-wider">
            Sent Requests ({outgoingRequests.length})
          </span>
          {outgoingRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-3 rounded-xl bg-surface-raised border border-surface-border"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-surface-base border border-surface-border flex items-center justify-center text-lg">
                  {req.friend?.avatar || '🕹️'}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-deck-100 truncate">
                    {req.friend?.displayName || 'Player'}
                  </span>
                  {req.friend?.email && (
                    <span className="text-[10px] text-deck-400 truncate">{req.friend.email}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium px-2 py-1 bg-amber-500/10 rounded-lg">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
