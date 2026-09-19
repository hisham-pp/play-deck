'use client';

import { CornerDownLeft, Lightbulb, Shuffle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@playdeck/ui';
import { cn } from '@/lib/utils';
import { currentRound } from '../engine/anagram-state';
import { hintFor } from '../engine/anagram-validator';
import type { AnagramState } from '../types/anagram-sprint.types';

export interface AnagramAnswerFormProps {
  state: AnagramState;
  /** False once this seat is home, out of guesses, or between words. */
  canAnswer: boolean;
  attemptsLeft: number;
  onSubmit: (word: string) => void;
  onType: () => void;
  onShuffle: () => void;
}

/** The typing surface: one field, a shuffle, and an opt-in clue. */
export function AnagramAnswerForm({
  state,
  canAnswer,
  attemptsLeft,
  onSubmit,
  onType,
  onShuffle,
}: AnagramAnswerFormProps) {
  const [draft, setDraft] = useState('');
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const round = currentRound(state);

  // A fresh word clears the box, hides the old clue and takes focus back, so
  // play stays keyboard-only from the first letter to the last.
  useEffect(() => {
    setDraft('');
    setShowHint(false);
    if (canAnswer) inputRef.current?.focus();
  }, [state.roundIndex, canAnswer]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim() || !canAnswer) return;
    onSubmit(draft);
    setDraft('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg flex flex-col items-center gap-2.5">
      <div className="w-full flex items-center gap-2">
        <input
          ref={inputRef}
          value={draft}
          disabled={!canAnswer}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Your answer"
          aria-invalid={state.lastRejection !== null}
          placeholder={canAnswer ? 'Unscramble it…' : 'Hold on…'}
          onChange={(event) => {
            setDraft(event.target.value);
            if (state.lastRejection) onType();
          }}
          className={cn(
            'w-full rounded-xl border bg-surface-raised px-4 py-3 text-center font-display text-2xl font-bold uppercase tracking-[0.2em] text-deck-900 dark:text-white placeholder:text-deck-500 placeholder:font-sans placeholder:text-sm placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 disabled:opacity-50',
            state.lastRejection
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-surface-border focus:border-amber-500 focus:ring-amber-500',
          )}
        />
        <Button type="submit" variant="arcade" size="lg" disabled={!canAnswer || !draft.trim()}>
          <CornerDownLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Answer</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onShuffle} disabled={!canAnswer}>
          <Shuffle className="mr-1.5 w-3.5 h-3.5" /> Shuffle
        </Button>
        {state.rules.hintsEnabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-expanded={showHint}
            onClick={() => setShowHint(true)}
            disabled={showHint || !round}
          >
            <Lightbulb className="mr-1.5 w-3.5 h-3.5" /> Hint
          </Button>
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display">
          {attemptsLeft} {attemptsLeft === 1 ? 'guess' : 'guesses'} left
        </span>
      </div>

      {showHint && round && (
        <p className="text-xs text-center text-amber-600 dark:text-amber-300">
          {hintFor(round.entry.word, round.entry.hint)}
        </p>
      )}

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
