'use client';

import { RotateCcw, Trophy, Users } from 'lucide-react';
import React from 'react';
import { Button } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { MODE_TEAM, TEAM_LABELS } from '../engine/anagram-constants';
import { rankPlayers } from '../engine/anagram-scoring';
import type { AnagramState } from '../types/anagram-sprint.types';

export interface AnagramGameOverProps {
  state: AnagramState;
  /** Absent for guests, who cannot deal a new card. */
  onPlayAgain?: () => void;
  onChangeSetup: () => void;
}

function headline(state: AnagramState): string {
  if (state.rules.mode === MODE_TEAM && state.winningTeam) {
    return `${TEAM_LABELS[state.winningTeam]} wins`;
  }
  const winners = state.players.filter((player) => state.winnerIds.includes(player.id));
  if (winners.length === 0) return 'No winner';
  if (winners.length === 1) return `${winners[0].name} wins`;
  return `${winners.map((player) => player.name).join(' & ')} tie`;
}

/** Final leaderboard, with everyone's match line rather than just the winner's. */
export function AnagramGameOver({ state, onPlayAgain, onChangeSetup }: AnagramGameOverProps) {
  const ranked = rankPlayers(state.players);

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
      <div className="flex flex-col items-center gap-1">
        <Trophy className="h-7 w-7 text-amber-500" aria-hidden="true" />
        <h2 className="font-display text-2xl font-black text-deck-950 dark:text-white">
          {headline(state)}
        </h2>
        <p className="text-xs text-deck-500">
          {state.history.length} words played · {state.rules.totalRounds} dealt
        </p>
      </div>

      <ul className="w-full flex flex-col gap-1.5">
        {ranked.map((player, index) => (
          <li
            key={player.id}
            className={cn(
              'flex items-center gap-2.5 rounded-lg border border-surface-border bg-surface-raised px-3 py-2',
              state.winnerIds.includes(player.id) && 'border-amber-500/50 bg-amber-500/10',
            )}
          >
            <span className="w-4 shrink-0 font-mono text-[11px] font-bold tabular-nums text-deck-500">
              {index + 1}
            </span>
            <span aria-hidden="true" className="shrink-0 text-base leading-none">
              {player.avatar}
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-semibold text-deck-900 dark:text-white">
                {player.name}
              </span>
              <span className="block text-[10px] text-deck-500">
                {player.solved} solved · best streak {player.bestStreak}
                {player.fastestMs !== null && ` · fastest ${(player.fastestMs / 1000).toFixed(2)}s`}
              </span>
            </span>
            <span className="shrink-0 font-display text-lg font-black tabular-nums text-deck-900 dark:text-white">
              {player.score}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onPlayAgain && (
          <Button variant="arcade" size="lg" onClick={onPlayAgain}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Play again
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={onChangeSetup}>
          <Users className="mr-1.5 h-4 w-4" /> Change setup
        </Button>
      </div>
    </div>
  );
}
