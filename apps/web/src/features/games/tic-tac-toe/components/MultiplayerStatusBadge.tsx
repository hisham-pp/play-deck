'use client';

import { Globe, Users } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/Button';

export interface MultiplayerStatusBadgeProps {
  roomCode: string | null;
  myMark: 'X' | 'O' | null;
  opponentName?: string | null;
  onOpenLobby: () => void;
  onLeaveRoom: () => void;
}

export function MultiplayerStatusBadge({
  roomCode,
  myMark,
  opponentName,
  onOpenLobby,
  onLeaveRoom,
}: MultiplayerStatusBadgeProps) {
  if (!roomCode) {
    return (
      <div className="p-3 rounded-xl bg-surface-raised border border-surface-border flex flex-col items-center gap-2 text-center">
        <p className="text-xs text-deck-400">
          Create a room with a 6-digit code or enter a code to join.
        </p>
        <Button type="button" variant="primary" size="sm" onClick={onOpenLobby} className="w-full">
          Open Match Lobby
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-surface-raised border border-surface-border flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-mono font-bold text-xs">
          {myMark || 'X'}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold font-mono text-deck-950 dark:text-white">
              Room #{roomCode}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-deck-400 mt-0.5">
            <Users className="w-3 h-3" />
            <span>{opponentName ? `Vs ${opponentName}` : 'Waiting for player...'}</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onLeaveRoom}
        className="text-xs text-rose-400 hover:text-rose-300"
      >
        Leave
      </Button>
    </div>
  );
}
