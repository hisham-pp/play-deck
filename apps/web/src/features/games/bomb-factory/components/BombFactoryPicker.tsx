'use client';

import React, { useRef } from 'react';

export interface PickerOption {
  id: string;
  label: string;
  glyph?: string;
  hint?: string;
}

interface BombFactoryPickerProps {
  legend: string;
  options: PickerOption[];
  value: string | null;
  onChange: (id: string) => void;
  /** Grid width, so Up/Down step a whole row on the bay wall. */
  columns?: number;
  disabled?: boolean;
}

const STEP_KEYS: Record<string, number> = {
  ArrowRight: 1,
  ArrowLeft: -1,
  ArrowDown: 0,
  ArrowUp: 0,
};

/**
 * A radio group the whole game leans on — parts, bays, dials and tools. Arrow
 * keys move the selection and Tab leaves the group, which is what a screen
 * reader and a keyboard-only operator both expect.
 */
export function BombFactoryPicker({
  legend,
  options,
  value,
  onChange,
  columns = 1,
  disabled = false,
}: BombFactoryPickerProps) {
  const groupRef = useRef<HTMLDivElement>(null);

  const focusIndex = (index: number) => {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[index]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!(event.key in STEP_KEYS)) return;
    event.preventDefault();

    const rowStep = columns > 1 ? columns : 1;
    const delta =
      event.key === 'ArrowDown'
        ? rowStep
        : event.key === 'ArrowUp'
          ? -rowStep
          : STEP_KEYS[event.key];
    const next = (index + delta + options.length) % options.length;

    onChange(options[next].id);
    focusIndex(next);
  };

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.id === value),
  );

  return (
    <fieldset disabled={disabled} className="min-w-0">
      <legend className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deck-500">
        {legend}
      </legend>
      <div
        ref={groupRef}
        role="radiogroup"
        aria-label={legend}
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((option, index) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              tabIndex={index === activeIndex ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? 'border-amber-400 bg-amber-400/15 text-amber-200'
                  : 'border-surface-border bg-surface-overlay text-deck-300 hover:border-surface-border-hover'
              }`}
            >
              {option.glyph && (
                <span aria-hidden="true" className="text-base leading-none">
                  {option.glyph}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{option.label}</span>
                {option.hint && (
                  <span className="block truncate text-[10px] uppercase tracking-wide text-deck-500">
                    {option.hint}
                  </span>
                )}
              </span>
              {isActive && (
                <span aria-hidden="true" className="text-[10px] font-black text-amber-300">
                  ●
                </span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
