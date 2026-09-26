'use client';

import { ArrowUpDown, LayoutGrid, List, Search, Sparkles, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import type { GameCategory, GameDefinition } from '@playdeck/game-types';
import { AutoScrollBanner } from '@/components/game/AutoScrollBanner';
import { GameCard } from '@/components/game/GameCard';
import { gameService } from '@/features/games/services/game-service';
import { cn } from '@/lib/utils';
import { usePlayerStore } from '@/stores/player.store';

const CATEGORY_ALL: GameCategory = 'all';

const CATEGORIES: { id: GameCategory; label: string }[] = [
  { id: CATEGORY_ALL, label: 'All Games' },
  { id: 'arcade', label: '🕹️ Arcade' },
  { id: 'puzzle', label: '🧩 Puzzle' },
  { id: 'strategy', label: '♟️ Strategy' },
  { id: 'board', label: '🎲 Board' },
  { id: 'card', label: '🃏 Cards' },
  { id: 'casual', label: '⚡ Casual' },
];

const LAYOUT_GRID = 'grid';
const LAYOUT_COMPACT = 'compact';

export function GamesCatalogClient() {
  const [games, setGames] = useState<GameDefinition[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>(CATEGORY_ALL);
  const [playerFilter, setPlayerFilter] = useState<'all' | 'solo' | 'multiplayer'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'name' | 'players'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'compact'>(LAYOUT_GRID);
  const { initPlayer } = usePlayerStore();

  useEffect(() => {
    initPlayer();
    gameService.listGames().then(setGames);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category') as GameCategory;
      if (cat && CATEGORIES.some((c) => c.id === cat)) {
        setSelectedCategory(cat);
      }
      const mode = params.get('mode');
      if (mode === 'solo' || mode === 'multiplayer') {
        setPlayerFilter(mode);
      }
      const q = params.get('q');
      if (q) {
        setSearchQuery(q);
      }
    }
  }, [initPlayer]);

  const filteredGames = useMemo(() => {
    const list = games.filter((g) => {
      const matchesCategory = selectedCategory === CATEGORY_ALL || g.category === selectedCategory;
      const matchesPlayer =
        playerFilter === 'all'
          ? true
          : playerFilter === 'solo'
            ? g.players.min === 1 && g.players.max === 1
            : g.players.max > 1;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesPlayer && matchesSearch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'players') {
        return b.players.max - a.players.max;
      }
      // featured default
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [games, selectedCategory, playerFilter, searchQuery, sortBy]);

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
      <section className="flex flex-col gap-5">
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

        {/* Sub-bar: Player Filter, Sort, Search, and Layout Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border">
          {/* Player Mode Pill Group */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-surface-raised border border-surface-border">
              <button
                onClick={() => setPlayerFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  playerFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-deck-400 hover:text-white',
                )}
              >
                All
              </button>
              <button
                onClick={() => setPlayerFilter('solo')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  playerFilter === 'solo'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-deck-400 hover:text-white',
                )}
              >
                Solo (1P)
              </button>
              <button
                onClick={() => setPlayerFilter('multiplayer')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  playerFilter === 'multiplayer'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-deck-400 hover:text-white',
                )}
              >
                Multiplayer (2P+)
              </button>
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-raised border border-surface-border text-xs text-deck-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'featured' | 'name' | 'players')}
                  className="bg-transparent text-deck-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
                  aria-label="Sort games"
                >
                  <option value="featured" className="bg-surface-raised text-white">
                    Featured
                  </option>
                  <option value="name" className="bg-surface-raised text-white">
                    Name (A-Z)
                  </option>
                  <option value="players" className="bg-surface-raised text-white">
                    Player Count
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Input, Clear Button & Layout Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-deck-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search games, tags, rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-surface-border bg-surface-raised text-deck-900 dark:text-white placeholder-deck-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-deck-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Layout Mode Toggles */}
            <div className="flex items-center p-1 rounded-xl border border-surface-border bg-surface-raised">
              <button
                onClick={() => setLayoutMode(LAYOUT_GRID)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                  layoutMode === LAYOUT_GRID
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-deck-400 hover:text-white',
                )}
                title="Grid View"
                aria-label="Grid layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode(LAYOUT_COMPACT)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                  layoutMode === LAYOUT_COMPACT
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-deck-400 hover:text-white',
                )}
                title="List View"
                aria-label="Compact list layout"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Count Pill */}
        <div className="flex items-center justify-between text-xs text-deck-500">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-deck-200">{filteredGames.length}</strong> of{' '}
              {games.length} games
            </span>
            {(selectedCategory !== CATEGORY_ALL ||
              playerFilter !== 'all' ||
              searchQuery.trim() !== '') && (
              <span className="text-[11px] font-mono text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                Filtered
              </span>
            )}
          </div>

          {(selectedCategory !== CATEGORY_ALL ||
            playerFilter !== 'all' ||
            searchQuery.trim() !== '') && (
            <button
              onClick={() => {
                setSelectedCategory(CATEGORY_ALL);
                setPlayerFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-amber-500 hover:underline cursor-pointer font-medium"
            >
              Reset all filters
            </button>
          )}
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
                setPlayerFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-amber-500 font-bold hover:underline cursor-pointer"
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
