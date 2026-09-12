'use client';

import { Gauge, Globe, Sparkles, Turtle, Users, Zap } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { MODE_AI, MODE_LOCAL_2P, MODE_ONLINE } from '../engine/pen-fight-constants';
import type { AIDifficulty, PenFightMode, PenSpeedMode } from '../types/pen-fight.types';

interface PenFightMatchOptionsProps {
  mode: PenFightMode;
  speedMode: PenSpeedMode;
  difficulty: AIDifficulty;
  onModeChange: (mode: PenFightMode) => void;
  onSpeedModeChange: (speedMode: PenSpeedMode) => void;
  onDifficultyChange: (difficulty: AIDifficulty) => void;
}

const ICON_SM = 'w-4 h-4';
const BTN_TYPE = 'button';
const TAB_BASE =
  'flex flex-col items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all';
const TAB_ACTIVE = 'bg-amber-500 text-deck-950 shadow-sm';
const TAB_INACTIVE = 'text-deck-400 hover:text-white hover:bg-surface-overlay';

const DIFFICULTIES: { value: AIDifficulty; label: string }[] = [
  { value: 'rookie', label: 'Rookie' },
  { value: 'pro', label: 'Pro' },
  { value: 'legend', label: 'Legend' },
];

export function PenFightMatchOptions({
  mode,
  speedMode,
  difficulty,
  onModeChange,
  onSpeedModeChange,
  onDifficultyChange,
}: PenFightMatchOptionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-raised border border-surface-border">
        <button
          type={BTN_TYPE}
          onClick={() => onModeChange(MODE_AI)}
          className={cn(TAB_BASE, mode === MODE_AI ? TAB_ACTIVE : TAB_INACTIVE)}
        >
          <Sparkles className={ICON_SM} />
          <span>Vs CPU</span>
        </button>
        <button
          type={BTN_TYPE}
          onClick={() => onModeChange(MODE_LOCAL_2P)}
          className={cn(TAB_BASE, mode === MODE_LOCAL_2P ? TAB_ACTIVE : TAB_INACTIVE)}
        >
          <Users className={ICON_SM} />
          <span>Local 2P</span>
        </button>
        <button
          type={BTN_TYPE}
          onClick={() => onModeChange(MODE_ONLINE)}
          className={cn(TAB_BASE, mode === MODE_ONLINE ? TAB_ACTIVE : TAB_INACTIVE)}
        >
          <Globe className={ICON_SM} />
          <span>Online</span>
        </button>
      </div>

      {mode === MODE_AI && (
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type={BTN_TYPE}
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

      {/* Pen Movement Speed Option */}
      <div className="flex flex-col gap-1.5 rounded-xl border border-surface-border bg-surface-base/40 p-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-deck-400 uppercase tracking-wider">
          <Gauge className="w-3.5 h-3.5 text-amber-500" />
          <span>Pen Speed Physics</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type={BTN_TYPE}
            onClick={() => onSpeedModeChange('normal')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-bold transition-all',
              speedMode === 'normal'
                ? 'border-amber-500 bg-amber-500/15 text-amber-400'
                : 'border-surface-border text-deck-400 hover:text-white',
            )}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Normal Speed</span>
          </button>
          <button
            type={BTN_TYPE}
            onClick={() => onSpeedModeChange('slow')}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-bold transition-all',
              speedMode === 'slow'
                ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                : 'border-surface-border text-deck-400 hover:text-white',
            )}
          >
            <Turtle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Slow Motion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
