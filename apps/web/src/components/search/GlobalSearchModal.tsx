'use client';

import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useId, useMemo, useRef } from 'react';
import type { GameDefinition } from '@playdeck/game-types';
import { GAME_DEFINITIONS } from '@/data/games';
import { filterGames } from '@/features/games/services/search-games';
import { useSearchStore } from '@/stores/search.store';
import { SearchCategoryFilters } from './SearchCategoryFilters';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchFooter } from './SearchFooter';
import { SearchResultItem } from './SearchResultItem';
import { useSearchShortcuts } from './use-search-shortcuts';

export function GlobalSearchModal() {
  const router = useRouter();
  const searchInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { isMac } = useSearchShortcuts();

  const {
    isOpen,
    query,
    selectedCategory,
    selectedIndex,
    closeSearch,
    setQuery,
    setSelectedCategory,
    setSelectedIndex,
  } = useSearchStore();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredGames = useMemo(() => {
    return filterGames(GAME_DEFINITIONS, {
      query,
      category: selectedCategory,
    });
  }, [query, selectedCategory]);

  useEffect(() => {
    if (selectedIndex >= filteredGames.length && filteredGames.length > 0) {
      setSelectedIndex(0);
    }
  }, [filteredGames.length, selectedIndex, setSelectedIndex]);

  useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex, isOpen]);

  const handleLaunchGame = (game: GameDefinition, preferDetails = false) => {
    closeSearch();
    if (preferDetails || game.status !== 'available') {
      router.push(`/games/${game.id}`);
    } else {
      router.push(`/play/${game.id}`);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      return;
    }

    if (filteredGames.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((selectedIndex + 1) % filteredGames.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((selectedIndex - 1 + filteredGames.length) % filteredGames.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedGame = filteredGames[selectedIndex];
      if (selectedGame) {
        handleLaunchGame(selectedGame, e.shiftKey);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={searchInputId}
    >
      <div
        className="fixed inset-0 bg-deck-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
        onClick={closeSearch}
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-surface-border bg-surface-raised shadow-2xl z-10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        <div className="relative flex items-center px-4 py-3.5 border-b border-surface-border bg-surface-base/80">
          <Search className="w-5 h-5 text-amber-500 shrink-0 mr-3 animate-pulse" />
          <input
            id={searchInputId}
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results-list"
            aria-activedescendant={
              filteredGames[selectedIndex]
                ? `game-item-${filteredGames[selectedIndex]?.id}`
                : undefined
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search games, categories, tags... (↑↓ to move, ↵ to play)"
            className="w-full bg-transparent text-sm sm:text-base text-deck-900 dark:text-white placeholder:text-deck-500 focus:outline-none"
          />

          <div className="flex items-center gap-2 ml-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-deck-400 hover:text-white hover:bg-surface-overlay transition-colors"
                title="Clear search"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={closeSearch}
              className="px-2 py-1 rounded text-[11px] font-mono font-medium border border-surface-border bg-surface-overlay text-deck-400 hover:text-white transition-colors"
            >
              ESC
            </button>
          </div>
        </div>

        <SearchCategoryFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div
          id="search-results-list"
          role="listbox"
          className="max-h-[60vh] sm:max-h-[460px] overflow-y-auto p-2 divide-y divide-surface-border/40"
        >
          {filteredGames.length === 0 ? (
            <SearchEmptyState
              query={query}
              onReset={() => {
                setQuery('');
                setSelectedCategory('all');
              }}
              onClose={closeSearch}
            />
          ) : (
            filteredGames.map((game, index) => (
              <SearchResultItem
                key={game.id}
                game={game}
                isSelected={index === selectedIndex}
                onSelect={() => setSelectedIndex(index)}
                onLaunch={handleLaunchGame}
                itemRef={(el) => {
                  itemRefs.current[index] = el;
                }}
              />
            ))
          )}
        </div>

        <SearchFooter count={filteredGames.length} isMac={isMac} />
      </div>
    </div>
  );
}
