'use client';

import React from 'react';

import { Avatar, Badge, Button } from '@playdeck/ui';

import type { SpellingBeeMode, SpellingBeePlayer } from '../types/spelling-bee.types';

interface Props {
  mode: SpellingBeeMode;
  roomCode: string | null;
  players: SpellingBeePlayer[];
  isHost: boolean;
  onSetMode: (mode: SpellingBeeMode) => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemoveBot: (id: string) => void;
  onCreateRoom: () => void;
}

export function SpellingBeeLobby({
  mode,
  roomCode,
  players,
  isHost,
  onSetMode,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onCreateRoom,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <span>🐝</span> Spelling Bee
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Find as many words as you can using 7 letters. Every word must include the center letter!
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex flex-wrap justify-center gap-2">
        <ModeButton active={mode === 'solo'} onClick={() => onSetMode('solo')}>
          Solo
        </ModeButton>
        <ModeButton active={mode === 'daily'} onClick={() => onSetMode('daily')}>
          Daily Challenge
        </ModeButton>
        <ModeButton active={mode === 'race'} onClick={() => onSetMode('race')}>
          Race (Multiplayer)
        </ModeButton>
        <ModeButton active={mode === 'relay'} onClick={() => onSetMode('relay')}>
          Relay (Teams)
        </ModeButton>
      </div>

      {/* Multiplayer Room Section */}
      {(mode === 'race' || mode === 'relay') && (
        <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">ROOM CODE</span>
            {roomCode ? (
              <Badge variant="arcade" className="text-base tracking-widest font-mono px-3 py-1">
                {roomCode}
              </Badge>
            ) : (
              <Button size="sm" variant="secondary" onClick={onCreateRoom}>
                Create Room
              </Button>
            )}
          </div>

          {/* Player Roster */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-400 flex justify-between items-center">
              <span>PLAYERS ({players.length})</span>
              {isHost && players.length < 6 && (
                <Button size="sm" variant="ghost" onClick={onAddBot} className="text-xs h-7">
                  + Add Bot
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-slate-800/60 px-3 py-2 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <Avatar fallback={p.avatar} size="sm" />
                    <span className="text-xs font-medium text-slate-200 truncate max-w-[90px]">
                      {p.displayName}
                    </span>
                    {p.isHost && (
                      <Badge variant="warning" className="text-[9px] px-1 py-0">
                        HOST
                      </Badge>
                    )}
                  </div>
                  {isHost && p.isBot && (
                    <button
                      type="button"
                      onClick={() => onRemoveBot(p.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onStartGame}
        className="w-full font-bold shadow-lg shadow-amber-500/20"
      >
        {mode === 'solo' || mode === 'daily'
          ? 'Start Playing'
          : isHost
            ? 'Start Match'
            : 'Waiting for Host...'}
      </Button>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300'
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
      }`}
    >
      {children}
    </button>
  );
}
