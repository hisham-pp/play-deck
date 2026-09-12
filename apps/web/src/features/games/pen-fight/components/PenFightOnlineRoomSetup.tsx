'use client';

import { Copy, Globe, Loader2, Plus, UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import type { Player } from '@playdeck/game-types';
import { Button } from '@playdeck/ui';
import { InviteToRoomModal } from '@/features/friends/components/InviteToRoomModal';

const ICON_SM = 'w-4 h-4';
const BTN_TYPE = 'button';

interface PenFightOnlineRoomSetupProps {
  player: Player | null;
  roomCode: string | null;
  opponent: { displayName?: string } | null;
  connectionStatus: string;
  errorMessage: string | null;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
}

export function PenFightOnlineRoomSetup({
  roomCode,
  opponent,
  connectionStatus,
  errorMessage,
  onCreateRoom,
  onJoinRoom,
}: PenFightOnlineRoomSetupProps) {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="flex items-center justify-between text-xs font-bold text-amber-400">
        <div className="flex items-center gap-2">
          <Globe className={ICON_SM} />
          <span>Online Room Matchmaking</span>
        </div>
      </div>

      {roomCode ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <span className="text-[11px] font-medium text-deck-400">
            Room Created! Share code or invite your friend:
          </span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black tracking-widest text-amber-400 px-3 py-1 bg-amber-500/10 rounded-lg border border-amber-500/30">
              {roomCode}
            </span>
            <button
              type={BTN_TYPE}
              onClick={copyRoomCode}
              className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type={BTN_TYPE}
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded bg-amber-500 px-3 py-1.5 text-xs font-bold text-deck-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Invite Friend</span>
            </button>
          </div>

          <div className="p-2.5 rounded-lg border border-surface-border bg-surface-raised/80 w-full flex items-center justify-center gap-2 text-xs">
            {opponent ? (
              <>
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">
                  Opponent Connected ({opponent.displayName})!
                </span>
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span className="text-deck-300">Waiting for opponent to enter code...</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Button
            type={BTN_TYPE}
            variant="primary"
            onClick={onCreateRoom}
            disabled={connectionStatus === 'connecting'}
            className="w-full gap-2 text-xs py-2"
          >
            <Plus className={ICON_SM} />
            <span>Create Host Room</span>
          </Button>

          <div className="relative my-1 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border" />
            </div>
            <span className="relative bg-surface-base px-2 text-[10px] uppercase font-bold text-deck-400">
              OR JOIN EXISTING ROOM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="ENTER ROOM CODE"
              className="flex-1 uppercase tracking-widest font-mono text-center rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-amber-500"
            />
            <Button
              type={BTN_TYPE}
              variant="outline"
              onClick={() => onJoinRoom(inputCode.trim())}
              disabled={!inputCode.trim() || connectionStatus === 'connecting'}
              className="text-xs py-1.5"
            >
              Join
            </Button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="text-center font-mono text-[11px] text-red-400">{errorMessage}</div>
      )}

      {roomCode && (
        <InviteToRoomModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          gameId="pen-fight"
          roomCode={roomCode}
        />
      )}
    </div>
  );
}
