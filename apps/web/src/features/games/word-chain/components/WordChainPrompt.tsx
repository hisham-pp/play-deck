'use client';

import { CornerDownLeft } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { CATEGORY_LABELS } from '../engine/word-chain-constants';
import { turnConstraints } from '../engine/word-chain-state';
import type { WordChainState } from '../types/word-chain.types';

export interface WordChainPromptProps {
  state: WordChainState;
  onSubmit: (word: string) => void;
  onType: () => void;
}

/**
 * The required prefix is the single most important thing on screen, so it is
 * rendered at display size rather than folded into the input's placeholder.
 */
export function WordChainPrompt({ state, onSubmit, onType }: WordChainPromptProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isPlaying = state.status === 'playing';
  const player = state.players[state.turnIndex];
  const { minLength, category } = turnConstraints(state, state.turnCount);

  // A fresh turn clears the box and takes focus back, so play stays keyboard-only.
  useEffect(() => {
    setDraft('');
    if (isPlaying) inputRef.current?.focus();
  }, [state.turnCount, state.turnIndex, isPlaying]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !isPlaying) return;
    onSubmit(draft);
    setDraft('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
          {player ? `${player.name} — start with` : 'Start with'}
        </span>
        <span
          aria-label={
            state.requiredPrefix
              ? `Next word must start with ${state.requiredPrefix.split('').join(' ')}`
              : 'Play any word'
          }
          className="font-display text-6xl sm:text-7xl font-black tracking-tight text-amber-500 leading-none"
        >
          {state.requiredPrefix ? state.requiredPrefix.toUpperCase() : '—'}
        </span>
        <span className="text-[11px] text-deck-500">
          {minLength}+ letters
          {category ? ` · ${CATEGORY_LABELS[category]} only` : ''}
        </span>
      </div>

      <div className="w-full max-w-md flex items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          disabled={!isPlaying}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Your word"
          aria-invalid={state.lastRejection !== null}
          placeholder={isPlaying ? 'Type your word…' : 'Waiting…'}
          onChange={(event) => {
            setDraft(event.target.value);
            if (state.lastRejection) onType();
          }}
          className={cn(
            'w-full rounded-xl border bg-surface-raised px-4 py-3 text-center font-display text-2xl font-bold tracking-wide text-deck-900 dark:text-white placeholder:text-deck-500 placeholder:font-sans placeholder:text-sm placeholder:tracking-normal focus:outline-none focus:ring-2 disabled:opacity-50',
            state.lastRejection
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-surface-border focus:border-amber-500 focus:ring-amber-500',
          )}
        />
        <Button type="submit" variant="arcade" size="lg" disabled={!isPlaying || !draft.trim()}>
          <CornerDownLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Play</span>
        </Button>
      </div>

      <p
        className={cn(
          'min-h-[1.25rem] text-xs text-center',
          state.lastRejection ? 'text-rose-500 font-semibold' : 'text-deck-500',
        )}
      >
        {state.message}
      </p>
    </form>
  );
}
