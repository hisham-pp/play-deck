'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  CATEGORY_LABELS,
  MODE_BLURBS,
  MODE_LABELS,
  roundsForMode,
} from '../engine/anagram-constants';
import { AVAILABLE_CATEGORIES } from '../engine/anagram-word-bank';
import type { AnagramCategory, AnagramMode, AnagramRules } from '../types/anagram-sprint.types';

export interface AnagramRulesPickerProps {
  rules: AnagramRules;
  /** Which formats this screen can offer — solo offline, the rest in a room. */
  modes: readonly AnagramMode[];
  disabled?: boolean;
  onChange: (rules: AnagramRules) => void;
}

const LEGEND = 'text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display';

/** Mode, word bank and hints — the three things that change how a match plays. */
export function AnagramRulesPicker({
  rules,
  modes,
  disabled = false,
  onChange,
}: AnagramRulesPickerProps) {
  const setMode = (mode: AnagramMode) =>
    onChange({ ...rules, mode, totalRounds: roundsForMode(mode) });

  const setCategory = (value: string) =>
    onChange({ ...rules, category: value === 'mixed' ? null : (value as AnagramCategory) });

  return (
    <div className="flex flex-col gap-4">
      <fieldset disabled={disabled} className="flex flex-col gap-2">
        <legend className={LEGEND}>Mode</legend>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={rules.mode === mode}
              onClick={() => setMode(mode)}
              className={cn(
                'rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-50',
                rules.mode === mode
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-surface-border bg-surface-raised hover:border-surface-borderHover',
              )}
            >
              <span className="block font-display text-xs font-bold uppercase tracking-wide text-deck-900 dark:text-white">
                {MODE_LABELS[mode]}
              </span>
              <span className="block text-[10px] leading-tight text-deck-500">
                {MODE_BLURBS[mode]}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LEGEND}>Word bank</span>
          <select
            disabled={disabled}
            value={rules.category ?? 'mixed'}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-lg border border-surface-border bg-surface-raised px-3 py-2 text-sm text-deck-900 dark:text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
          >
            <option value="mixed">Everything</option>
            {AVAILABLE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={LEGEND}>Words</span>
          <span className="rounded-lg border border-surface-border bg-surface-overlay px-3 py-2 font-mono text-sm text-deck-600 dark:text-deck-300">
            {rules.totalRounds} · easy to hard
          </span>
        </label>
      </div>

      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          disabled={disabled}
          checked={rules.hintsEnabled}
          onChange={(event) => onChange({ ...rules, hintsEnabled: event.target.checked })}
          className="h-4 w-4 rounded border-surface-border accent-amber-500 disabled:opacity-50"
        />
        <span className="text-xs text-deck-600 dark:text-deck-300">
          Allow hints — a clue, the length and the opening letter, on request
        </span>
      </label>
    </div>
  );
}
