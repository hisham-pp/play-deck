'use client';

import { Award, Bot, Flame, RotateCcw, Target, Trophy, Zap } from 'lucide-react';
import React from 'react';
import { Modal } from '@playdeck/ui';
import type { PongStats } from '../engine/pong-types';
import { pongStatsRepository } from '../services/pong-stats-repository';

interface PongStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PongStats;
  onStatsReset: () => void;
}

const STAT_CARD_CLASS =
  'p-3 rounded-xl bg-surface-raised border border-surface-border flex items-center gap-3';
const STAT_ICON_CLASS = 'w-5 h-5';
const STAT_LABEL_CLASS = 'text-[11px] text-deck-400 font-semibold uppercase tracking-wider';
const STAT_VALUE_CLASS = 'text-xl font-bold font-mono text-white';

export function PongStatsModal({ isOpen, onClose, stats, onStatsReset }: PongStatsModalProps) {
  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset your Pong lifetime stats?')) {
      await pongStatsRepository.resetStats();
      onStatsReset();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pong Lifetime Records">
      <div className="flex flex-col gap-4 py-2">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Trophy className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Matches Won</div>
              <div className={STAT_VALUE_CLASS}>{stats.gamesWon}</div>
            </div>
          </div>

          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Award className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Win Rate</div>
              <div className={STAT_VALUE_CLASS}>{winRate}%</div>
            </div>
          </div>

          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
              <Flame className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Longest Rally</div>
              <div className={STAT_VALUE_CLASS}>{stats.highestRally} hits</div>
            </div>
          </div>

          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Target className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Points Scored</div>
              <div className={STAT_VALUE_CLASS}>{stats.totalPointsScored}</div>
            </div>
          </div>

          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Zap className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Matches Played</div>
              <div className={STAT_VALUE_CLASS}>{stats.gamesPlayed}</div>
            </div>
          </div>

          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <Bot className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Hard AI Wins</div>
              <div className={STAT_VALUE_CLASS}>{stats.vsAiWins.hard}</div>
            </div>
          </div>
        </div>

        {/* AI Breakdown */}
        <div className="p-3 rounded-xl bg-surface-raised border border-surface-border">
          <div className="text-xs font-semibold text-deck-300 uppercase tracking-wider mb-2">
            vs AI Victory Breakdown
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-surface-overlay rounded-lg border border-surface-border/60">
              <span className="text-[10px] text-deck-400 uppercase font-mono block">Easy</span>
              <span className="text-sm font-bold font-mono text-white">{stats.vsAiWins.easy}</span>
            </div>
            <div className="p-2 bg-surface-overlay rounded-lg border border-surface-border/60">
              <span className="text-[10px] text-deck-400 uppercase font-mono block">Medium</span>
              <span className="text-sm font-bold font-mono text-white">
                {stats.vsAiWins.medium}
              </span>
            </div>
            <div className="p-2 bg-surface-overlay rounded-lg border border-surface-border/60">
              <span className="text-[10px] text-deck-400 uppercase font-mono block">Hard</span>
              <span className="text-sm font-bold font-mono text-white">{stats.vsAiWins.hard}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Records</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-deck-700 hover:bg-deck-600 text-white font-medium text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
