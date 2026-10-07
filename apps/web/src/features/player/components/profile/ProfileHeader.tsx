import React from 'react';

export function ProfileHeader() {
  return (
    <div className="flex flex-col gap-2 pb-4 border-b border-surface-border">
      <h1 className="text-3xl font-extrabold text-deck-950 dark:text-white font-display tracking-tight">
        Player Profile
      </h1>
      <p className="text-sm text-deck-500">
        Manage your player identity, Supabase account status, and stats.
      </p>
    </div>
  );
}
