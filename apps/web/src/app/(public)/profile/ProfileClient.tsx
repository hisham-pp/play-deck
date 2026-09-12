'use client';

import { Trophy, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { usePlayerStore } from '@/stores/player.store';

const AVATARS = ['🕹️', '👾', '🚀', '♟️', '🎲', '🎯', '⚡', '🐉', '🦊'];

export function ProfileClient() {
  const { player, stats, initPlayer, updateDisplayName, updateAvatar } = usePlayerStore();
  const [nameInput, setNameInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    initPlayer();
  }, [initPlayer]);

  useEffect(() => {
    if (player) {
      setNameInput(player.displayName);
    }
  }, [player]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    await updateDisplayName(nameInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-2 pb-4 border-b border-surface-border">
        <h1 className="text-3xl font-extrabold text-deck-950 dark:text-white font-display tracking-tight">
          Player Profile
        </h1>
        <p className="text-sm text-deck-500">
          Manage your local player identity, avatar, and inspect client storage.
        </p>
      </div>

      {/* Identity Card */}
      <div className="p-6 rounded-xl border border-surface-border bg-surface-raised flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center text-4xl shadow-sm">
          {player?.avatar || '🕹️'}
        </div>

        <div className="flex-1">
          <form onSubmit={handleSaveName} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-deck-500 block mb-1">
                Display Name
              </label>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm rounded-md border border-surface-border bg-surface-overlay text-deck-900 dark:text-white focus:outline-none focus:border-amber-500"
                  maxLength={24}
                />
                <Button type="submit" variant="primary" size="sm">
                  {isSaved ? <Check className="w-4 h-4" /> : 'Save'}
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-deck-400 font-mono">
              Player ID: {player?.id || 'loading...'}
            </p>
          </form>
        </div>
      </div>

      {/* Avatar Picker */}
      <div className="p-6 rounded-xl border border-surface-border bg-surface-raised flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-deck-500 font-display">
          Choose Your Avatar
        </h3>
        <div className="flex flex-wrap gap-3">
          {AVATARS.map((av) => (
            <button
              key={av}
              onClick={() => updateAvatar(av)}
              className={`w-12 h-12 rounded-lg border flex items-center justify-center text-2xl transition-all ${
                player?.avatar === av
                  ? 'border-amber-500 bg-amber-500/10 scale-105'
                  : 'border-surface-border bg-surface-overlay hover:border-surface-borderHover'
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 rounded-xl border border-surface-border bg-surface-raised flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-deck-500 font-display">
            Local Stats
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border">
            <span className="text-2xl font-black text-deck-950 dark:text-white font-display">
              {stats.gamesPlayed}
            </span>
            <p className="text-xs text-deck-400 mt-1">Games Played</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border">
            <span className="text-2xl font-black text-emerald-500 font-display">{stats.wins}</span>
            <p className="text-xs text-deck-400 mt-1">Victories</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-overlay border border-surface-border">
            <span className="text-2xl font-black text-rose-500 font-display">{stats.losses}</span>
            <p className="text-xs text-deck-400 mt-1">Defeats</p>
          </div>
        </div>
      </div>
    </div>
  );
}
