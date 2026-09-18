'use client';

import React from 'react';
import { DIFFICULTY_TIERS } from '../engine/bomb-factory-constants';
import type { BombFactoryDifficulty } from '../types/bomb-factory.types';

interface BombFactoryDifficultyPickerProps {
  value: BombFactoryDifficulty;
  onChange: (next: BombFactoryDifficulty) => void;
  disabled?: boolean;
}

export function BombFactoryDifficultyPicker({
  value,
  onChange,
  disabled = false,
}: BombFactoryDifficultyPickerProps) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deck-500">
        Shift difficulty
      </legend>
      <div role="radiogroup" aria-label="Shift difficulty" className="grid gap-2">
        {DIFFICULTY_TIERS.map((tier) => {
          const isActive = tier.id === value;
          return (
            <button
              key={tier.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onChange(tier.id)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive
                  ? 'border-amber-400 bg-amber-400/15'
                  : 'border-surface-border bg-surface-overlay hover:border-surface-border-hover'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-deck-100">{tier.label}</span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-deck-500">
                  {tier.stepsPerMachine.length} machines · {tier.timeLimitSeconds}s
                </span>
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-deck-400">
                {tier.summary}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
