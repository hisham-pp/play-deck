'use client';

import { Check, Copy, Play, Users } from 'lucide-react';
import React, { useState } from 'react';
import {
  GRAVITY_GOLF_MAX_SEATS,
  GRAVITY_GOLF_SEAT_COLORS,
  useGravityGolfMultiplayerStore,
} from '@/stores/gravity-golf-multiplayer.store';

interface GravityGolfRoomLobbyProps {
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function GravityGolfRoomLobby({ onStartGame, onLeaveRoom }: GravityGolfRoomLobbyProps) {
  const { roomCode, seats, isHost } = useGravityGolfMultiplayerStore();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!roomCode) return;
    const url = `${window.location.origin}/play/gravity-golf?room=${roomCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-2xl border border-surface-border bg-surface-raised/95 backdrop-blur-md shadow-2xl flex flex-col items-center gap-6">
      <div className="text-center">
        <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
          Multiplayer Flight Control
        </span>
        <h2 className="text-2xl font-black text-white font-display mt-1">Cosmic Room Lobby</h2>
        <p className="text-xs text-deck-400 mt-1">
          Share your 6-digit room code with up to 3 other astronauts.
        </p>
      </div>

      {/* Room Code Card */}
      <div className="w-full p-4 rounded-xl border border-surface-border bg-surface-overlay flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-mono text-deck-500">Room Code</div>
          <div className="text-2xl font-black font-mono tracking-widest text-amber-400">
            {roomCode}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-raised hover:bg-surface-border border border-surface-border text-xs font-bold text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Link!' : 'Copy Invite Link'}</span>
        </button>
      </div>

      {/* Seats Roster */}
      <div className="w-full">
        <div className="flex items-center justify-between text-xs text-deck-400 mb-2">
          <span className="flex items-center gap-1.5 font-semibold">
            <Users className="w-3.5 h-3.5" />
            Flight Crew ({seats.length}/{GRAVITY_GOLF_MAX_SEATS})
          </span>
          <span className="text-[11px] font-mono">1–4 Players</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {Array.from({ length: GRAVITY_GOLF_MAX_SEATS }).map((_, idx) => {
            const player = seats[idx];
            const color = GRAVITY_GOLF_SEAT_COLORS[idx];

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  player
                    ? 'border-surface-border bg-surface-overlay'
                    : 'border-surface-border/40 bg-surface-base/30 border-dashed'
                }`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold text-deck-950 border"
                  style={{
                    backgroundColor: player ? color : 'transparent',
                    borderColor: color,
                  }}
                >
                  {player ? player.avatar || '⛳' : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {player ? player.name : 'Waiting for player...'}
                  </div>
                  <div className="text-[10px] text-deck-400">
                    {player
                      ? player.isHost
                        ? 'Mission Commander (Host)'
                        : 'Crew Member'
                      : 'Seat Open'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 w-full pt-2">
        <button
          type="button"
          onClick={onLeaveRoom}
          className="px-5 py-2.5 rounded-xl border border-surface-border bg-surface-overlay text-deck-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Leave Room
        </button>

        {isHost() ? (
          <button
            type="button"
            onClick={onStartGame}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-deck-950 font-black text-xs uppercase tracking-wider transition-all shadow-arcade cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Mission</span>
          </button>
        ) : (
          <div className="flex-1 text-center py-2.5 text-xs text-deck-400 font-semibold italic">
            Waiting for host to launch the mission...
          </div>
        )}
      </div>
    </div>
  );
}
