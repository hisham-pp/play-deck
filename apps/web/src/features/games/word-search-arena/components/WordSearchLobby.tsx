'use client';

import React from 'react';

import { Button } from '@playdeck/ui';

import type {
  GridSize,
  GridTheme,
  WordSearchMode,
  WordSearchPlayer,
} from '../types/word-search.types';

const SOLO_MODE: WordSearchMode = 'solo';

const MODES: Array<{ id: WordSearchMode; label: string; icon: string; desc: string }> = [
  { id: SOLO_MODE, label: 'Solo', icon: '🧭', desc: 'Race against the clock alone' },
  { id: 'race', label: 'Race', icon: '⚡', desc: 'First to find all words wins' },
  { id: 'elimination', label: 'Elimination', icon: '💀', desc: 'Slowest player each round is out' },
  { id: 'teams', label: 'Teams', icon: '🤝', desc: 'Collaborate in pairs or trios' },
];

const THEMES: Array<{ id: GridTheme; label: string; icon: string }> = [
  { id: 'animals', label: 'Animals', icon: '🦁' },
  { id: 'countries', label: 'Countries', icon: '🌍' },
  { id: 'food', label: 'Food', icon: '🍕' },
  { id: 'science', label: 'Science', icon: '🔬' },
  { id: 'sports', label: 'Sports', icon: '⚽' },
  { id: 'mixed', label: 'Mixed', icon: '🎲' },
];

const SIZES: Array<{ id: GridSize; label: string; desc: string }> = [
  { id: 'small', label: 'Small', desc: '10×10' },
  { id: 'medium', label: 'Medium', desc: '12×12' },
  { id: 'large', label: 'Large', desc: '15×15' },
];

interface Props {
  mode: WordSearchMode;
  theme: GridTheme;
  gridSize: GridSize;
  roomCode: string | null;
  players: WordSearchPlayer[];
  isHost: boolean;
  onSetMode: (mode: WordSearchMode) => void;
  onSetTheme: (theme: GridTheme) => void;
  onSetSize: (size: GridSize) => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemoveBot: (id: string) => void;
  onCreateRoom: () => void;
}

export function WordSearchLobby({
  mode,
  theme,
  gridSize,
  roomCode,
  players,
  isHost,
  onSetMode,
  onSetTheme,
  onSetSize,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onCreateRoom,
}: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
      {/* Mode selector */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Game Mode
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onSetMode(m.id)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all text-center ${
                mode === m.id
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              <span className="text-2xl">{m.icon}</span>
              <span className="text-xs font-semibold">{m.label}</span>
              <span className="text-[10px] text-slate-500 leading-tight">{m.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme & size */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Theme
          </p>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => onSetTheme(t.id)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all ${
                  theme === t.id
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <span className="text-[10px]">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Grid Size
          </p>
          <div className="flex flex-col gap-2">
            {SIZES.map((s) => (
              <button
                key={s.id}
                onClick={() => onSetSize(s.id)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all ${
                  gridSize === s.id
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <span className="text-sm font-semibold">{s.label}</span>
                <span className="text-xs font-mono text-slate-500">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Multiplayer room */}
      {mode !== SOLO_MODE && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">ROOM CODE</span>
            {roomCode ? (
              <span className="text-base tracking-widest font-mono px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg">
                {roomCode}
              </span>
            ) : (
              <Button size="sm" variant="secondary" onClick={onCreateRoom}>
                Create Room
              </Button>
            )}
          </div>

          {/* Players */}
          {players.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-700/50"
                >
                  <span>{p.avatar}</span>
                  <span className="text-xs text-slate-300">{p.displayName}</span>
                  {p.isBot && isHost && (
                    <button
                      onClick={() => onRemoveBot(p.id)}
                      className="text-slate-500 hover:text-red-400 text-xs ml-1"
                      aria-label={`Remove ${p.displayName}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {players.length < 6 && isHost && (
                <button
                  onClick={onAddBot}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-slate-600 text-xs text-slate-500 hover:text-slate-300 hover:border-slate-500"
                >
                  + Add Bot
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Start button */}
      {(mode === SOLO_MODE || isHost) && (
        <Button
          variant="arcade"
          size="lg"
          onClick={onStartGame}
          className="w-full"
          disabled={mode !== SOLO_MODE && !roomCode}
        >
          {mode === SOLO_MODE ? '🔍 Start Searching' : '🚀 Start Game'}
        </Button>
      )}
    </div>
  );
}
