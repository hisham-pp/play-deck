'use client';

import React from 'react';
import { usePlayerStore } from '@/stores/player.store';
import { AccountStatusCard } from '../components/AccountStatusCard';
import { PreferencesCard } from '../components/PreferencesCard';

export default function ProfileSettingsPage() {
  const { player, isLoadingAuth, setAuthModalOpen, signOut } = usePlayerStore();
  
  return (
    <div className="flex flex-col gap-8">
      <PreferencesCard />
      
      <AccountStatusCard
        player={player}
        isLoading={isLoadingAuth}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={signOut}
      />
    </div>
  );
}
