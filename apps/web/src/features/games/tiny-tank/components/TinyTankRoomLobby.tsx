'use client';

import React, { useState } from 'react';
import { TinyTankVoiceDock } from '@/features/voice/components/TinyTankVoiceDock';
import { useTinyTankMultiplayerStore } from '@/stores/tiny-tank-multiplayer.store';

interface TinyTankRoomLobbyProps {
  onStartMatch: () => void;
  onBackToLobby: () => void;
}

export function TinyTankRoomLobby({ onStartMatch, onBackToLobby }: TinyTankRoomLobbyProps) {
  const { roomCode, players, isHost, addBot, removeBot, leaveRoom } = useTinyTankMultiplayerStore();

  const [copied, setCopied] = useState(false);
  const host = isHost();

  const handleCopyLink = async () => {
    if (typeof window === 'undefined' || !roomCode) return;
    const url = `${window.location.origin}/play/tiny-tank-arena?room=${roomCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    leaveRoom();
    onBackToLobby();
  };

  return (
    <div className="w-full max-w-[960px] mx-auto bg-slate-900/90 border border-slate-700/60 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-slate-100 flex flex-col gap-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
            ONLINE MULTIPLAYER ROOM
          </span>
          <h1 className="text-2xl font-black text-slate-100 mt-1">Tiny Tank Squadron Lobby</h1>
        </div>

        {/* Room Code & Copy */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-mono">CODE:</span>
          <span className="font-mono text-base font-black text-amber-400 tracking-wider">
            {roomCode ?? '------'}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            {copied ? '✓ Copied' : 'Copy Invite'}
          </button>
        </div>
      </div>

      {/* Embedded WebRTC Voice Dock */}
      <div className="w-full">
        <TinyTankVoiceDock />
      </div>

      {/* Roster of 6 Tanks */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            DEPLOYED TANKS ({players.length}/6)
          </span>
          {host && players.length < 6 && (
            <button
              type="button"
              onClick={addBot}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all"
            >
              + Add AI Bot
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border"
                  style={{
                    backgroundColor: `${p.color}25`,
                    borderColor: p.color,
                    color: p.color,
                  }}
                >
                  {p.isBot ? '🤖' : idx + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>{p.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {p.isBot ? 'Autonomous Unit' : 'Commander'}
                  </span>
                </div>
              </div>

              {host && p.isBot && (
                <button
                  type="button"
                  onClick={() => removeBot(p.id)}
                  className="text-xs text-red-400 hover:text-red-300 p-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Empty Slots */}
          {[...Array(Math.max(0, 6 - players.length))].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center p-3 rounded-xl border border-dashed border-slate-800 text-xs text-slate-600 font-mono"
            >
              [ Empty Tank Bay ]
            </div>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLeave}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-800/60 border border-slate-700/60 transition-all"
        >
          Leave Room
        </button>

        {host ? (
          <button
            type="button"
            disabled={players.length < 2}
            onClick={onStartMatch}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              players.length >= 2
                ? 'bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Launch Arena Combat
          </button>
        ) : (
          <span className="text-xs text-amber-400/80 italic">
            Waiting for host to launch battle...
          </span>
        )}
      </div>
    </div>
  );
}
