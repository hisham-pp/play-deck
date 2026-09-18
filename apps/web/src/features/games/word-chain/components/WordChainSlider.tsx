'use client';

import React, { useId } from 'react';

export interface WordChainSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

/** A labelled range input — the native control keeps keyboard support for free. */
export function WordChainSlider({ label, value, min, max, onChange }: WordChainSliderProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-raised px-3 py-2.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={id}
          className="text-[10px] font-bold uppercase tracking-widest text-deck-500 font-display"
        >
          {label}
        </label>
        <span className="font-mono text-lg font-bold text-amber-500 leading-none">{value}</span>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-amber-500 cursor-pointer"
      />
    </div>
  );
}
