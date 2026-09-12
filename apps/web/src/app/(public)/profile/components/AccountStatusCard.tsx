'use client';

import { Shield, UserCheck, LogIn, LogOut } from 'lucide-react';
import React from 'react';
import type { Player } from '@playdeck/game-types';
import { Button } from '@/components/ui/Button';

export interface AccountStatusCardProps {
  player: Player | null;
  isLoading: boolean;
  onOpenAuth: () => void;
  onSignOut: () => Promise<void>;
}

export function AccountStatusCard({
  player,
  isLoading,
  onOpenAuth,
  onSignOut,
}: AccountStatusCardProps) {
  const isGuest = Boolean(player?.isGuest);

  return (
    <div className="p-6 rounded-xl border border-surface-border bg-surface-raised flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
            isGuest
              ? 'bg-deck-800/40 border-surface-border text-deck-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          {isGuest ? <Shield className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-deck-950 dark:text-white font-display">
              {isGuest ? 'Guest Player' : 'Supabase Account'}
            </h2>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                isGuest
                  ? 'bg-surface-overlay text-deck-400 border border-surface-border'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isGuest ? 'Local Storage' : 'Database Synced'}
            </span>
          </div>
          <p className="text-xs text-deck-400 mt-1">
            {isGuest
              ? 'Your session and stats save locally in this browser.'
              : `Signed in as ${player?.email || 'player'}. User profile saved in Supabase users table.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-stretch sm:self-auto">
        {isGuest ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenAuth}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onSignOut}
            loading={isLoading}
            className="w-full sm:w-auto flex items-center gap-2 text-rose-400 hover:text-rose-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        )}
      </div>
    </div>
  );
}
