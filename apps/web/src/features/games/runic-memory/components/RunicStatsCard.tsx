'use client';

import { Brain, Clock, Flame, Move, Target, Trophy } from 'lucide-react';
import React from 'react';
import { GRID_CONFIGS } from '../engine/runic-memory-constants';
import type { DifficultyLevel, GameMode } from '../types/runic-memory.types';

interface RunicStatsCardProps {
  mode: GameMode;
  difficulty: DifficultyLevel;
  moves: number;
  matches: number;
  combo: number;
  maxCombo: number;
  elapsedSeconds: number;
}

const STAT_ROW_CLS = 'flex items-center gap-2.5';
const STAT_COL_CLS = 'flex flex-col';
const STAT_LBL_CLS = 'text-[10px] text-deck-500 uppercase font-semibold';

export function RunicStatsCard({
  mode,
  difficulty,
  moves,
  matches,
  maxCombo,
  elapsedSeconds,
}: RunicStatsCardProps) {
  const config = GRID_CONFIGS[difficulty] || GRID_CONFIGS.apprentice;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Accuracy calculation
  const accuracy = moves > 0 ? Math.min(100, Math.round((matches / moves) * 100)) : 100;

  // Rank calculation based on moves and accuracy
  let rank = 'Initiate';
  let rankColor = 'text-sky-400';
  if (accuracy >= 80 && moves <= config.turnTarget) {
    rank = 'Elder Sage';
    rankColor = 'text-amber-400';
  } else if (accuracy >= 55) {
    rank = 'Rune Master';
    rankColor = 'text-purple-400';
  } else if (accuracy >= 35) {
    rank = 'Adept';
    rankColor = 'text-emerald-400';
  }

  return (
    <div className="p-4 rounded-xl bg-surface-overlay border border-surface-border flex flex-col gap-3">
      <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-deck-300">
            Brain Training
          </span>
        </div>
        <span className="text-[11px] font-mono text-deck-500 uppercase">{config.label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className={STAT_ROW_CLS}>
          <Clock className="w-4 h-4 text-amber-400/80" />
          <div className={STAT_COL_CLS}>
            <span className={STAT_LBL_CLS}>Time</span>
            <span className="font-mono font-bold text-deck-200">{timeFormatted}</span>
          </div>
        </div>

        <div className={STAT_ROW_CLS}>
          <Move className="w-4 h-4 text-cyan-400/80" />
          <div className={STAT_COL_CLS}>
            <span className={STAT_LBL_CLS}>Turns Taken</span>
            <span className="font-mono font-bold text-deck-200">
              {moves} <span className="text-[10px] text-deck-500">/ par {config.turnTarget}</span>
            </span>
          </div>
        </div>

        <div className={STAT_ROW_CLS}>
          <Target className="w-4 h-4 text-emerald-400/80" />
          <div className={STAT_COL_CLS}>
            <span className={STAT_LBL_CLS}>Accuracy</span>
            <span className="font-mono font-bold text-emerald-400">{accuracy}%</span>
          </div>
        </div>

        <div className={STAT_ROW_CLS}>
          <Flame className="w-4 h-4 text-orange-400/80" />
          <div className={STAT_COL_CLS}>
            <span className={STAT_LBL_CLS}>Max Combo</span>
            <span className="font-mono font-bold text-orange-400">×{maxCombo}</span>
          </div>
        </div>
      </div>

      {mode === 'solo' && (
        <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-deck-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Rating:</span>
          </div>
          <span className={`text-xs font-bold font-mono ${rankColor}`}>{rank}</span>
        </div>
      )}
    </div>
  );
}
