'use client';

import { Sparkles, Users } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { MODE_AI, MODE_LOCAL_2P } from '../engine/pen-fight-constants';
import type { AIDifficulty, PenFightMode } from '../types/pen-fight.types';

interface PenFightMatchOptionsProps {
  mode: PenFightMode;
  difficulty: AIDifficulty;
  onModeChange: (mode: PenFightMode) => void;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
}

const ICON_SM = 'w-4 h-4';
const TAB_BASE =
  'flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-bold transition-all';
const TAB_ACTIVE = 'bg-amber-500 text-deck-950 shadow-sm';
const TAB_INACTIVE = 'text-deck-400 hover:text-white hover:bg-surface-overlay';

const DIFFICULTIES: { value: AIDifficulty; label: string }[] = [
  { value: 'rookie', label: 'Rookie' },
  { value: 'pro', label: 'Pro' },
  { value: 'legend', label: 'Legend' },
];

export function PenFightMatchOptions({
  mode,
  difficulty,
  onModeChange,
  onDifficultyChange,
}: PenFightMatchOptionsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-raised border border-surface-border">
        <button
          type="button"
          onClick={() => onModeChange(MODE_AI)}
          className={cn(TAB_BASE, mode === MODE_AI ? TAB_ACTIVE : TAB_INACTIVE)}
        >
          <Sparkles className={ICON_SM} />
          <span>Vs CPU</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange(MODE_LOCAL_2P)}
          className={cn(TAB_BASE, mode === MODE_LOCAL_2P ? TAB_ACTIVE : TAB_INACTIVE)}
        >
          <Users className={ICON_SM} />
          <span>Local 2P</span>
        </button>
      </div>

      {mode === MODE_AI && (
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onDifficultyChange(d.value)}
              className={cn(
                'rounded-lg border py-2 text-xs font-bold transition-all',
                difficulty === d.value
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                  : 'border-surface-border text-deck-400 hover:text-white',
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
