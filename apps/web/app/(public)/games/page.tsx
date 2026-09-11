'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { GameDefinition, GameCategory } from '@playdeck/game-types';
import { GameCard } from '@/components/game/GameCard';
import { gameService } from '@/features/games/services/game-service';
import { cn } from '@/lib/utils';

const CATEGORIES: { id: GameCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'board', label: 'Board' },
];

const LAYOUT_GRID = 'grid';
const LAYOUT_COMPACT = 'compact';

export default function GamesCatalogPage() {
  const [games, setGames] = useState<GameDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'compact'>(LAYOUT_GRID);

  useEffect(() => {
    gameService.listGames().then(setGames);
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchesCategory = selectedCategory === 'all' || g.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-deck-950 dark:text-white font-display tracking-tight">
          Games
        </h1>
        <p className="text-sm text-deck-500">
          Explore our collection of local and upcoming multiplayer games.
        </p>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        {/* Category buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex-shrink-0',
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-surface-raised border border-surface-border text-deck-600 dark:text-deck-400 hover:text-deck-950 dark:hover:text-white hover:bg-surface-overlay',
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input & layout toggle */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-deck-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-md border border-surface-border bg-surface-raised text-deck-900 dark:text-white placeholder-deck-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={() => setLayoutMode((m) => (m === LAYOUT_GRID ? LAYOUT_COMPACT : LAYOUT_GRID))}
            className="p-1.5 rounded-md border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-500 transition-colors"
            title="Toggle card layout"
            aria-label="Toggle layout"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Games display */}
      {filteredGames.length === 0 ? (
        <div className="text-center py-16 text-deck-500 text-sm">
          No games match your search or filter.
        </div>
      ) : layoutMode === LAYOUT_GRID ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} layout="standard" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-3xl">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} layout="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
