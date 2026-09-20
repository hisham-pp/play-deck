'use client';

import React from 'react';

import type { SecretMissionPlayer } from '../types/secret-mission.types';

interface Props {
  roomCode: string | null;
  players: SecretMissionPlayer[];
  isHost: boolean;
  onAddBot: () => void;
  onRemoveBot: (id: string) => void;
  onStart: () => void;
}

export function SecretMissionLobby({
  roomCode,
  players,
  isHost,
  onAddBot,
  onRemoveBot,
  onStart,
}: Props) {
  const canStart = isHost && players.length >= 3;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <p className="text-4xl">🕵️‍♂️</p>
        <h2 className="text-2xl font-black text-white font-display">Secret Mission</h2>
        <p className="text-sm text-deck-400">
          Complete your secret objective without getting caught!
        </p>
      </div>

      {roomCode && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/10 p-4 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
            Room Code
          </p>
          <p className="text-3xl font-black tracking-widest text-white font-mono">{roomCode}</p>
        </div>
      )}

      <div className="rounded-xl border border-surface-border bg-surface-raised p-4 space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-deck-400">
          Agents ({players.length}/8)
        </p>
        <div className="space-y-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-surface-base px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{p.avatar}</span>
                <span className="text-sm font-semibold text-white">{p.displayName}</span>
                {p.isHost && <span className="text-xs text-amber-400 font-bold">(Host)</span>}
                {p.isBot && <span className="text-xs text-deck-500 font-bold">(Bot)</span>}
              </div>
              {isHost && p.isBot && (
                <button
                  onClick={() => onRemoveBot(p.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        {isHost && players.length < 8 && (
          <button
            onClick={onAddBot}
            className="w-full py-2 rounded-lg border border-dashed border-surface-border text-deck-500 hover:text-deck-300 text-sm transition-colors"
          >
            + Add Agent Bot
          </button>
        )}
      </div>

      {isHost && (
        <button
          onClick={onStart}
          disabled={!canStart}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-surface-base font-black text-sm uppercase tracking-wider transition-colors"
        >
          {canStart ? 'Start Mission' : `Need ${Math.max(0, 3 - players.length)} more agent(s)`}
        </button>
      )}
    </div>
  );
}
