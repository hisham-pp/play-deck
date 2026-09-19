'use client';

import { Settings2 } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import { MODE_LABELS } from '../engine/anagram-constants';
import type { AnagramStats } from '../types/anagram-sprint.types';

export interface AnagramStatsCardProps {
  stats: AnagramStats | null;
  onOpenSetup: () => void;
}

const ROW = 'flex items-center justify-between px-3 py-1.5 text-xs';
const LABEL = 'text-deck-500';
const VALUE = 'font-mono font-bold text-deck-900 dark:text-white';

export function AnagramStatsCard({ stats, onOpenSetup }: AnagramStatsCardProps) {
  const fastest = stats?.fastestMs;

  return (
    <section
      aria-label="Your Anagram Sprint records"
      className="w-full rounded-xl border border-surface-border bg-surface-raised overflow-hidden"
    >
      <header className="h-9 px-3 flex items-center border-b border-surface-border bg-surface-overlay">
        <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
          Your records
        </span>
      </header>

      <div className="divide-y divide-surface-border/60">
        <div className={ROW}>
          <span className={LABEL}>Matches played</span>
          <span className={VALUE}>{stats?.gamesPlayed ?? 0}</span>
        </div>
        <div className={ROW}>
          <span className={LABEL}>Matches won</span>
          <span className={VALUE}>{stats?.gamesWon ?? 0}</span>
        </div>
        <div className={ROW}>
          <span className={LABEL}>Best score</span>
          <span className={VALUE}>{stats?.bestScore ?? 0}</span>
        </div>
        <div className={ROW}>
          <span className={LABEL}>Words solved</span>
          <span className={VALUE}>{stats?.wordsSolved ?? 0}</span>
        </div>
        <div className={ROW}>
          <span className={LABEL}>Longest streak</span>
          <span className={VALUE}>{stats?.longestStreak ?? 0}</span>
        </div>
        <div className={ROW}>
          <span className={LABEL}>Fastest solve</span>
          <span className={VALUE}>
            {typeof fastest === 'number' ? `${(fastest / 1000).toFixed(2)}s` : '—'}
          </span>
        </div>
        <div className={ROW}>
          <span className={LABEL}>Last mode</span>
          <span className={VALUE}>{stats?.lastMode ? MODE_LABELS[stats.lastMode] : '—'}</span>
        </div>
      </div>

      <div className="p-3 border-t border-surface-border">
        <Button variant="outline" size="sm" className="w-full" onClick={onOpenSetup}>
          <Settings2 className="w-4 h-4" />
          Change setup
        </Button>
      </div>
    </section>
  );
}
