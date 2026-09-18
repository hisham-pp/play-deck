'use client';

import { Button } from '@playdeck/ui';

export interface ElevatorOption<T extends string | number> {
  value: T;
  label: string;
}

interface ElevatorOptionRowProps<T extends string | number> {
  label: string;
  hint?: string;
  options: ElevatorOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** A labelled row of mutually exclusive choices, used across the setup screens. */
export function ElevatorOptionRow<T extends string | number>({
  label,
  hint,
  options,
  value,
  onChange,
}: ElevatorOptionRowProps<T>) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-semibold uppercase tracking-wider text-deck-400">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={option.value === value ? 'primary' : 'outline'}
            role="radio"
            aria-checked={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {hint && <p className="text-xs text-deck-500">{hint}</p>}
    </fieldset>
  );
}
