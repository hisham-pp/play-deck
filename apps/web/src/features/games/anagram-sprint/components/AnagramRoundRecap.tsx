'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS } from '../engine/anagram-constants';
import type { AnagramRoundRecap as Recap, AnagramState } from '../types/anagram-sprint.types';

export interface AnagramRoundRecapProps {
  state: AnagramState;
  recap: Recap;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function seconds(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`;
}

/** The reveal between words: the answer, who got there, and what it paid. */
export function AnagramRoundRecap({ state, recap }: AnagramRoundRecapProps) {
  const nameOf = (playerId: string) =>
    state.players.find((player) => player.id === playerId)?.name ?? 'Player';

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4 text-center">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
          The word was
        </span>
        <span className="font-display text-4xl sm:text-5xl font-black uppercase tracking-wide text-amber-500 leading-none">
          {recap.answer}
        </span>
        <span className="text-[11px] text-deck-500">
          {CATEGORY_LABELS[recap.category]} · {recap.difficulty}
        </span>
      </div>

      {recap.results.length === 0 ? (
        <p className="text-sm text-deck-500">Nobody got that one.</p>
      ) : (
        <ul className="w-full flex flex-col gap-1.5">
          {recap.results.map((result) => (
            <li
              key={result.playerId}
              className={cn(
                'flex items-center gap-2 rounded-lg border border-surface-border bg-surface-raised px-3 py-2',
                result.placement === 1 && 'border-amber-500/50 bg-amber-500/10',
              )}
            >
              <span aria-hidden="true" className="w-5 shrink-0 text-sm">
                {MEDALS[result.placement - 1] ?? `${result.placement}.`}
              </span>
              <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-deck-900 dark:text-white">
                {nameOf(result.playerId)}
                {result.word !== recap.answer && (
                  <span className="ml-1.5 text-[10px] font-normal uppercase tracking-wider text-deck-500">
                    {result.word}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-deck-500">
                {seconds(result.elapsedMs)}
              </span>
              <span className="w-14 shrink-0 text-right font-display text-sm font-black tabular-nums text-emerald-500">
                +{result.points}
              </span>
            </li>
          ))}
        </ul>
      )}

      {recap.missedIds.length > 0 && (
        <p className="text-[11px] text-deck-500">
          Missed by {recap.missedIds.map(nameOf).join(', ')}
        </p>
      )}
    </div>
  );
}
