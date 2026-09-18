'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface WordChainOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

export interface WordChainOptionGridProps<T extends string> {
  legend: string;
  options: readonly WordChainOption<T>[];
  value: T;
  columns?: 2 | 3 | 4;
  onChange: (value: T) => void;
}

const CARD_BASE =
  'text-left rounded-xl border px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';
const CARD_ACTIVE = 'border-amber-500/70 bg-amber-500/10';
const CARD_IDLE = 'border-surface-border bg-surface-raised hover:border-amber-500/40';

const COLUMN_CLASSES: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

/** A radio group drawn as arcade tiles — one shared control for every rules picker. */
export function WordChainOptionGrid<T extends string>({
  legend,
  options,
  value,
  columns = 2,
  onChange,
}: WordChainOptionGridProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display mb-2">
        {legend}
      </legend>

      <div className={cn('grid gap-2', COLUMN_CLASSES[columns])}>
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(CARD_BASE, isActive ? CARD_ACTIVE : CARD_IDLE)}
            >
              <span className="block text-xs font-bold text-deck-900 dark:text-white font-display">
                {option.label}
              </span>
              {option.description && (
                <span className="block mt-1 text-[11px] leading-snug text-deck-600 dark:text-deck-400">
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
