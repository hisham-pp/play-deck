'use client';

import { Check, Flame, Heart, WifiOff } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { MODE_SURVIVAL, MODE_TEAM, TEAM_A, TEAM_B, TEAM_LABELS } from '../engine/anagram-constants';
import { rankPlayers, teamScore } from '../engine/anagram-scoring';
import { hasAnswered } from '../engine/anagram-state';
import type { AnagramState } from '../types/anagram-sprint.types';

export interface AnagramScoreboardProps {
  state: AnagramState;
  localPlayerId?: string | null;
  /** Seats missing from the room's presence roster. */
  disconnectedIds?: readonly string[];
}

function TeamTotals({ state }: { state: AnagramState }) {
  return (
    <div className="grid grid-cols-2 gap-2 border-b border-surface-border p-3">
      {[TEAM_A, TEAM_B].map((team) => (
        <div key={team} className="flex flex-col items-center gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
            {TEAM_LABELS[team]}
          </span>
          <span className="font-display text-xl font-black tabular-nums text-deck-900 dark:text-white">
            {teamScore(state.players, team)}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Live standings. During a word it shows who is home; points land at the recap. */
export function AnagramScoreboard({
  state,
  localPlayerId,
  disconnectedIds = [],
}: AnagramScoreboardProps) {
  const ranked = rankPlayers(state.players);
  const isSurvival = state.rules.mode === MODE_SURVIVAL;

  return (
    <section
      aria-label="Scoreboard"
      className="w-full rounded-xl border border-surface-border bg-surface-raised shadow-arcade overflow-hidden"
    >
      {state.rules.mode === MODE_TEAM && <TeamTotals state={state} />}

      <ul className="divide-y divide-surface-border">
        {ranked.map((player, index) => {
          const isHome = hasAnswered(state, player.id);
          const isOffline = disconnectedIds.includes(player.id);

          return (
            <li
              key={player.id}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2',
                player.id === localPlayerId && 'bg-amber-500/5',
                player.eliminated && 'opacity-45',
              )}
            >
              <span className="w-4 shrink-0 font-mono text-[11px] font-bold tabular-nums text-deck-500">
                {index + 1}
              </span>
              <span aria-hidden="true" className="shrink-0 text-base leading-none">
                {player.avatar}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-deck-900 dark:text-white">
                    {player.name}
                  </span>
                  {isOffline && (
                    <WifiOff className="h-3 w-3 shrink-0 text-deck-500" aria-label="Disconnected" />
                  )}
                </span>
                <span className="flex items-center gap-2 text-[10px] text-deck-500">
                  <span>{player.solved} solved</span>
                  {player.streak > 1 && (
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Flame className="h-2.5 w-2.5" aria-hidden="true" />
                      <span>{player.streak}</span>
                      <span className="sr-only">in a row</span>
                    </span>
                  )}
                  {isSurvival && (
                    <span className="flex items-center gap-0.5 text-rose-500">
                      <Heart className="h-2.5 w-2.5" aria-hidden="true" />
                      <span>{player.lives}</span>
                      <span className="sr-only">lives left</span>
                    </span>
                  )}
                </span>
              </span>

              {isHome && (
                <Check
                  className="h-4 w-4 shrink-0 text-emerald-500"
                  aria-label={`${player.name} has answered`}
                />
              )}
              <span className="shrink-0 font-display text-base font-black tabular-nums text-deck-900 dark:text-white">
                {player.score}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
