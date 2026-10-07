'use client';

import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePlayerStore } from '@/stores/player.store';
import { PlayerLevelCard } from './components/PlayerLevelCard';
import { ProfileStatsCard } from './components/ProfileStatsCard';
import { BestScoresCard } from './components/BestScoresCard';

const AVATARS = ['🕹️', '👾', '🚀', '♟️', '🎲', '🎯', '⚡', '🐉', '🦊'];

export default function ProfileOverviewPage() {
  const { player, stats, updateDisplayName, updateAvatar } = usePlayerStore();
  const [nameInput, setNameInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

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
    <div className="flex flex-col gap-8">
      {/* Player Level & XP Progression */}
      <PlayerLevelCard stats={stats} />

      {/* Identity Card */}
      <div className="p-6 rounded-2xl border border-surface-border bg-surface-raised flex flex-col sm:flex-row items-start sm:items-center gap-6 shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center text-4xl shadow-sm shrink-0">
          {player?.avatar || '🕹️'}
        </div>

        <div className="flex-1 w-full">
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
                  className="flex-1 px-3 py-2 text-sm rounded-md border border-surface-border bg-surface-overlay text-deck-900 dark:text-white focus:outline-none focus:border-amber-500"
                  maxLength={24}
                />
                <Button type="submit" variant="primary" size="sm">
                  {isSaved ? <Check className="w-4 h-4" /> : 'Save'}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-deck-400 font-mono">
              <span className="truncate max-w-xs">ID: {player?.id || 'loading...'}</span>
            </div>
          </form>
        </div>
      </div>

      {/* Avatar Picker */}
      <div className="p-6 rounded-2xl border border-surface-border bg-surface-raised flex flex-col gap-4 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-deck-500 font-display">
          Choose Your Avatar
        </h3>
        <div className="flex flex-wrap gap-3">
          {AVATARS.map((av) => (
            <button
              key={av}
              onClick={() => updateAvatar(av)}
              className={`w-14 h-14 rounded-xl border flex items-center justify-center text-3xl transition-all ${
                player?.avatar === av
                  ? 'border-amber-500 bg-amber-500/10 scale-105 shadow-sm ring-2 ring-amber-400/40'
                  : 'border-surface-border bg-surface-overlay hover:border-surface-borderHover'
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Match Statistics */}
      <ProfileStatsCard stats={stats} />

      {/* Personal High Scores & Records */}
      <BestScoresCard stats={stats} />
    </div>
  );
}
