'use client';

import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { GameDefinition, GameCategory } from '@playdeck/game-types';
import { AutoScrollBanner } from '@/components/game/AutoScrollBanner';
import { GameCard } from '@/components/game/GameCard';
import { gameService } from '@/features/games/services/game-service';
import { cn } from '@/lib/utils';

const CATEGORY_ALL: GameCategory = 'all';

const CATEGORIES: { id: GameCategory; label: string }[] = [
  { id: CATEGORY_ALL, label: 'All Games' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'board', label: 'Board' },
];

const LAYOUT_GRID = 'grid';
const LAYOUT_COMPACT = 'compact';

export function GamesCatalogClient() {
  const [games, setGames] = useState<GameDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>(CATEGORY_ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'compact'>(LAYOUT_GRID);

  useEffect(() => {
    gameService.listGames().then(setGames);
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchesCategory = selectedCategory === CATEGORY_ALL || g.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Page Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PlayDeck Game Center</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-deck-950 dark:text-white font-display uppercase tracking-tight">
          Games Catalog
        </h1>
        <p className="text-sm md:text-base text-deck-500 max-w-2xl">
          Discover hand-crafted browser games designed for instant local play. Click any cartridge
          to jump straight into the action.
        </p>
      </div>

      {/* 2. Auto-Scrolling Featured Banner Showcase */}
      {games.length > 0 && (
        <section aria-label="Featured Games Showcase">
          <AutoScrollBanner games={games} intervalMs={4500} />
        </section>
      )}

      {/* 3. Filter Tabs & Search Controls */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
          {/* Category tabs */}
          <div
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer',
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-surface-raised border border-surface-border text-deck-400 hover:text-white hover:bg-surface-overlay',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search input & layout toggle */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-deck-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search games, tags, rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-surface-border bg-surface-raised text-deck-900 dark:text-white placeholder-deck-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>

            <button
              onClick={() =>
                setLayoutMode((m) => (m === LAYOUT_GRID ? LAYOUT_COMPACT : LAYOUT_GRID))
              }
              className="p-2 rounded-xl border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle card view layout"
              aria-label="Toggle layout"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Games List Grid / Compact View */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-surface-border bg-surface-raised/40">
            <p className="text-deck-400 text-sm font-medium">
              No games match your search or filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(CATEGORY_ALL);
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-amber-500 font-bold hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : layoutMode === LAYOUT_GRID ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} layout="standard" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-4xl">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} layout="compact" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
