'use client';

import React from 'react';
import { Button, Modal } from '@playdeck/ui';
import {
  DIFFICULTY_BEGINNER,
  DIFFICULTY_CUSTOM,
  DIFFICULTY_EXPERT,
  DIFFICULTY_INTERMEDIATE,
} from '../engine/minesweeper-constants';
import type { MinesweeperDifficulty, MinesweeperStats } from '../types/minesweeper.types';

interface MinesweeperStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: MinesweeperStats | null;
}

const DIFFICULTY_LABELS: Record<MinesweeperDifficulty, string> = {
  beginner: 'Beginner (9×9)',
  intermediate: 'Intermediate (16×16)',
  expert: 'Expert (16×30)',
  custom: 'Custom Boards',
};

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

export function MinesweeperStatsModal({ isOpen, onClose, stats }: MinesweeperStatsModalProps) {
  if (!stats) return null;

  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const diffKeys: MinesweeperDifficulty[] = [
    DIFFICULTY_BEGINNER,
    DIFFICULTY_INTERMEDIATE,
    DIFFICULTY_EXPERT,
    DIFFICULTY_CUSTOM,
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Minesweeper Statistics">
      <div className="flex flex-col gap-6 py-2">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-deck-950/80 border border-deck-800 p-3 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-deck-500 tracking-wider">
              Played
            </span>
            <div className="text-xl font-mono font-bold text-white mt-1">{stats.gamesPlayed}</div>
          </div>
          <div className="bg-deck-950/80 border border-deck-800 p-3 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-deck-500 tracking-wider">
              Won
            </span>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
              {stats.gamesWon}
            </div>
          </div>
          <div className="bg-deck-950/80 border border-deck-800 p-3 rounded-lg text-center">
            <span className="text-[10px] uppercase font-bold text-deck-500 tracking-wider">
              Win Rate
            </span>
            <div className="text-xl font-mono font-bold text-amber-400 mt-1">{winRate}%</div>
          </div>
        </div>

        {/* Breakdown by difficulty */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase text-deck-400 tracking-wider">
            Records by Preset
          </span>
          <div className="space-y-2">
            {diffKeys.map((diff) => {
              const diffStat = stats.byDifficulty[diff];
              const diffWinRate =
                diffStat && diffStat.played > 0
                  ? Math.round((diffStat.won / diffStat.played) * 100)
                  : 0;

              return (
                <div
                  key={diff}
                  className="flex items-center justify-between p-3 bg-deck-950/60 border border-deck-800/80 rounded-lg text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-deck-200">{DIFFICULTY_LABELS[diff]}</span>
                    <span className="text-[10px] text-deck-500">
                      Won {diffStat?.won ?? 0} of {diffStat?.played ?? 0} ({diffWinRate}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-[10px] text-deck-500 uppercase">Streak</div>
                      <div className="font-mono font-semibold text-deck-300">
                        {diffStat?.currentStreak ?? 0} (max {diffStat?.bestStreak ?? 0})
                      </div>
                    </div>

                    <div className="min-w-[50px]">
                      <div className="text-[10px] text-deck-500 uppercase">Best</div>
                      <div className="font-mono font-bold text-amber-400">
                        {formatDuration(diffStat?.bestTimeMs ?? null)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
