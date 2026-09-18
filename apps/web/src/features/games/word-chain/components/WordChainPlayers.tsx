'use client';

import { Heart } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { MODE_POINTS } from '../engine/word-chain-constants';
import { TEAM_LABELS } from '../engine/word-chain-state';
import type { WordChainPlayer, WordChainState } from '../types/word-chain.types';

export interface WordChainPlayersProps {
  state: WordChainState;
}

function Lives({ player, total }: { player: WordChainPlayer; total: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`${player.lives} of ${total} lives left`}
    >
      {Array.from({ length: total }, (_, index) => (
        <Heart
          key={index}
          aria-hidden
          className={cn(
            'w-3 h-3',
            index < player.lives ? 'text-rose-500 fill-rose-500' : 'text-deck-600/40',
          )}
        />
      ))}
    </span>
  );
}

export function WordChainPlayers({ state }: WordChainPlayersProps) {
  const showLives = state.rules.mode !== MODE_POINTS;
  const showTeams = state.rules.mode === 'team';

  return (
    <section
      aria-label="Players"
      className="w-full rounded-xl border border-surface-border bg-surface-raised overflow-hidden"
    >
      <header className="h-9 px-3 flex items-center border-b border-surface-border bg-surface-overlay">
        <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
          Players
        </span>
      </header>

      <ul className="divide-y divide-surface-border/60">
        {state.players.map((player, index) => {
          const isActive = index === state.turnIndex && state.status === 'playing';
          return (
            <li
              key={player.id}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'px-3 py-2 flex items-center justify-between gap-2 transition-colors',
                isActive && 'bg-amber-500/10',
                player.eliminated && 'opacity-45',
              )}
            >
              <div className="min-w-0">
                <p
                  className={cn(
                    'text-xs font-bold truncate font-display',
                    isActive
                      ? 'text-amber-600 dark:text-amber-300'
                      : 'text-deck-900 dark:text-white',
                    player.eliminated && 'line-through',
                  )}
                >
                  {player.name}
                </p>
                <p className="text-[10px] text-deck-500 truncate">
                  {showTeams ? `${TEAM_LABELS[player.team]} · ` : ''}
                  {player.wordsPlayed} {player.wordsPlayed === 1 ? 'word' : 'words'}
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className="font-mono text-sm font-bold text-deck-900 dark:text-white leading-none">
                  {player.score}
                </span>
                {showLives && <Lives player={player} total={state.rules.lives} />}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
