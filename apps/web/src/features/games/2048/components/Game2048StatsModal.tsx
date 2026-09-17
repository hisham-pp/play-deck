import { Award, Flame, Trophy, Zap, Hash } from 'lucide-react';
import React from 'react';
import { Modal } from '@playdeck/ui';
import type { Game2048Stats } from '../types/2048.types';

interface Game2048StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Game2048Stats;
}

const STAT_CARD_CLASS =
  'p-3 rounded-xl bg-surface-raised border border-surface-border flex items-center gap-3';
const STAT_ICON_CLASS = 'w-5 h-5';
const STAT_LABEL_CLASS = 'text-[11px] text-deck-400 font-semibold uppercase tracking-wider';
const STAT_VALUE_CLASS = 'text-xl font-bold font-mono text-white';

export function Game2048StatsModal({ isOpen, onClose, stats }: Game2048StatsModalProps) {
  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="2048 Records & Stats">
      <div className="flex flex-col gap-4 py-2">
        {/* Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Trophy className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Best Score</div>
              <div className={STAT_VALUE_CLASS}>{stats.bestScore}</div>
            </div>
          </div>

          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Award className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Highest Tile</div>
              <div className={STAT_VALUE_CLASS}>{stats.highestTile || '—'}</div>
            </div>
          </div>

          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
              <Zap className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Games Played</div>
              <div className={STAT_VALUE_CLASS}>{stats.gamesPlayed}</div>
            </div>
          </div>

          <div className={STAT_CARD_CLASS}>
            <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
              <Flame className={STAT_ICON_CLASS} />
            </div>
            <div>
              <div className={STAT_LABEL_CLASS}>Win Rate (2048)</div>
              <div className={STAT_VALUE_CLASS}>
                {winRate}% ({stats.gamesWon})
              </div>
            </div>
          </div>
        </div>

        {/* Moves Summary */}
        <div className="p-3 rounded-xl bg-surface-base border border-surface-border flex items-center justify-between text-xs text-deck-400">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-deck-500" />
            <span>Lifetime Slide Count</span>
          </div>
          <span className="font-mono font-bold text-deck-200">
            {stats.totalMoves.toLocaleString()} moves
          </span>
        </div>
      </div>
    </Modal>
  );
}
