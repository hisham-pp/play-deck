'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PEN_COLORS } from '../types/pen-fight.types';
import type { PenColor } from '../types/pen-fight.types';

interface PenFightColorPickerProps {
  selected: PenColor;
  taken: PenColor;
  onSelect: (color: PenColor) => void;
}

export function PenFightColorPicker({ selected, taken, onSelect }: PenFightColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PEN_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          disabled={color === taken}
          onClick={() => onSelect(color)}
          className={cn(
            'h-7 w-7 rounded-full border-2 transition-all disabled:cursor-not-allowed disabled:opacity-25',
            selected === color ? 'border-white scale-110 shadow-lg' : 'border-white/10',
          )}
          style={{ backgroundColor: color }}
          aria-label={`Choose pen color ${color}`}
        />
      ))}
    </div>
  );
}
