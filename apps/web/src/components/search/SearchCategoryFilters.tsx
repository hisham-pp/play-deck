'use client';

import React from 'react';
import type { GameCategory } from '@playdeck/game-types';
import { cn } from '@/lib/utils';

const CATEGORIES: { id: GameCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'board', label: 'Board' },
];

interface SearchCategoryFiltersProps {
  selectedCategory: GameCategory | 'all';
  onSelectCategory: (category: GameCategory | 'all') => void;
}

export function SearchCategoryFilters({
  selectedCategory,
  onSelectCategory,
}: SearchCategoryFiltersProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-surface-border/70 bg-surface-raised overflow-x-auto">
      <span className="text-[11px] font-medium text-deck-500 uppercase tracking-wider mr-1 hidden sm:inline">
        Filters:
      </span>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelectCategory(cat.id)}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0',
            selectedCategory === cat.id
              ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
              : 'bg-surface-overlay text-deck-400 hover:text-white hover:bg-surface-border',
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
