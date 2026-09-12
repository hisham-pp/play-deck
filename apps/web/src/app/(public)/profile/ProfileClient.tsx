'use client';

import { Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { usePlayerStore } from '@/stores/player.store';
import { AccountStatusCard } from './components/AccountStatusCard';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileStatsCard } from './components/ProfileStatsCard';

const AVATARS = ['🕹️', '👾', '🚀', '♟️', '🎲', '🎯', '⚡', '🐉', '🦊'];

export function ProfileClient() {
  const {
    player,
    stats,
    initPlayer,
    updateDisplayName,
    updateAvatar,
    setAuthModalOpen,
    signOut,
    isLoadingAuth,
  } = usePlayerStore();

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
      <ProfileHeader />

      <AccountStatusCard
        player={player}
        isLoading={isLoadingAuth}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={signOut}
      />

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
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-deck-400 font-mono">
              <span>ID: {player?.id || 'loading...'}</span>
              {player?.email && <span>Email: {player.email}</span>}
            </div>
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

      <ProfileStatsCard stats={stats} />
    </div>
  );
}
