'use client';

import React, { useState } from 'react';

import { TrustOrBetrayVoiceDock } from '@/features/voice/components/TrustOrBetrayVoiceDock';
import { useTrustMultiplayerStore } from '@/stores/trust-or-betray-multiplayer.store';

export interface TrustOrBetrayRoomLobbyProps {
  onStartMatch: () => void;
  onBackToLobby: () => void;
}

export function TrustOrBetrayRoomLobby({
  onStartMatch,
  onBackToLobby,
}: TrustOrBetrayRoomLobbyProps) {
  const { roomCode, players, isHost, addBot, removeBot, leaveRoom, roundCount, setRoundCount } =
    useTrustMultiplayerStore();

  const [copied, setCopied] = useState(false);
  const host = isHost();

  const handleCopyLink = async () => {
    if (typeof window === 'undefined' || !roomCode) return;
    const url = `${window.location.origin}/play/trust-or-betray?room=${roomCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    leaveRoom();
    onBackToLobby();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-slate-100 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-black tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            Multiplayer Tactical Lounge
          </span>
          <h1 className="text-2xl font-black text-slate-100 mt-1.5">
            Trust or Betray — Secret Room
          </h1>
        </div>

        {/* Room Code & Invite */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2 font-mono">CODE:</span>
          <span className="font-mono text-base font-black text-amber-400 tracking-wider">
            {roomCode ?? '------'}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            {copied ? '✓ Copied' : 'Copy Invite'}
          </button>
        </div>
      </div>

      {/* Embedded WebRTC Voice Dock */}
      <div className="w-full">
        <TrustOrBetrayVoiceDock />
      </div>

      {/* Roster & Host Settings */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">
            Operatives ({players.length}/8)
          </h2>
          {host && players.length < 8 && (
            <button
              type="button"
              onClick={addBot}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all cursor-pointer"
            >
              + Add Bot Operative
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {players.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg border border-slate-700/60 shrink-0"
                  style={{ backgroundColor: `${p.color}20` }}
                >
                  {p.avatar}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {p.isBot ? 'Autonomous AI' : 'Human Operative'}
                  </div>
                </div>
              </div>

              {host && p.isBot && (
                <button
                  type="button"
                  onClick={() => removeBot(p.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                  title="Remove bot"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Host Settings */}
      {host && (
        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-200">Operation Length</div>
            <div className="text-[11px] text-slate-400">
              Total mission rounds before final debriefing
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[3, 5, 7].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setRoundCount(count)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  roundCount === count
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {count} Rounds
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleLeave}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
        >
          Leave Room
        </button>

        {host ? (
          <button
            type="button"
            disabled={players.length < 3}
            onClick={onStartMatch}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
              players.length >= 3
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-950/50'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {players.length >= 3 ? 'Initiate Operation' : 'Need 3+ Players to Start'}
          </button>
        ) : (
          <div className="text-xs text-amber-400 font-mono animate-pulse">
            Waiting for host to initiate operation...
          </div>
        )}
      </div>
    </div>
  );
}
