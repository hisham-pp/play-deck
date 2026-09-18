'use client';

import { Link2, Zap } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import type { WordChainState } from '../types/word-chain.types';

export interface WordChainHistoryProps {
  state: WordChainState;
}

/** The newest link sits on top so the live end of the chain never scrolls away. */
export function WordChainHistory({ state }: WordChainHistoryProps) {
  const seed = state.usedWords[0];
  const links = [...state.chain].reverse();

  return (
    <section
      aria-label="Word chain so far"
      className="w-full rounded-xl border border-surface-border bg-surface-raised overflow-hidden"
    >
      <header className="h-9 px-3 flex items-center justify-between border-b border-surface-border bg-surface-overlay">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
          <Link2 className="w-3.5 h-3.5 text-amber-500" />
          The chain
        </span>
        <span className="font-mono text-xs font-bold text-deck-800 dark:text-deck-200">
          {state.chain.length}
        </span>
      </header>

      <ol className="max-h-[320px] overflow-y-auto divide-y divide-surface-border/60">
        {links.map((entry, index) => (
          <li
            key={`${entry.word}-${links.length - index}`}
            className={cn(
              'px-3 py-2 flex items-center justify-between gap-3',
              index === 0 && 'bg-amber-500/5',
            )}
          >
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-deck-900 dark:text-white truncate">
                <span className="text-amber-500">{entry.word.slice(0, 1).toUpperCase()}</span>
                {entry.word.slice(1)}
              </p>
              <p className="text-[10px] text-deck-500 truncate">{entry.playerName}</p>
            </div>

            <span className="shrink-0 flex items-center gap-1 font-mono text-xs font-bold text-deck-700 dark:text-deck-300">
              {entry.isSpeedBonus && (
                <Zap className="w-3 h-3 text-amber-500" aria-label="Speed bonus" />
              )}
              +{entry.points}
            </span>
          </li>
        ))}

        {seed && (
          <li className="px-3 py-2 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-display text-sm font-bold text-deck-500 truncate">{seed}</p>
              <p className="text-[10px] text-deck-500">Opening word</p>
            </div>
          </li>
        )}
      </ol>
    </section>
  );
}
