'use client';

import { ArrowRight, Compass, Gamepad2, Search, Sparkles, Swords, Trophy, X } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import type { GameDefinition } from '@playdeck/game-types';
import { EmptyShelf } from '@/components/game/EmptyShelf';
import { GameCard } from '@/components/game/GameCard';
import { Button } from '@/components/ui/Button';
import { gameService } from '@/features/games/services/game-service';
import { useLibraryStore } from '@/stores/library.store';
import { usePlayerStore } from '@/stores/player.store';

export function HomeClient() {
  const [allGames, setAllGames] = useState<GameDefinition[]>([]);
  const [featuredGames, setFeaturedGames] = useState<GameDefinition[]>([]);
  const [homeSearch, setHomeSearch] = useState('');
  const { recentSessions, initLibrary } = useLibraryStore();
  const { initPlayer } = usePlayerStore();

  useEffect(() => {
    initLibrary();
    initPlayer();
    gameService.listGames().then(setAllGames);
    gameService.getFeaturedGames().then(setFeaturedGames);
  }, [initLibrary, initPlayer]);

  // Stickman Games signature series
  const stickmanGames = useMemo(() => {
    return allGames.filter((g) => g.id.startsWith('stickman-'));
  }, [allGames]);

  // Popular / trending highlights across genres
  const popularGames = useMemo(() => {
    const popularIds = [
      'bomber-arena',
      'word-battle',
      'train-rush',
      'reaction-arena',
      'physics-football',
      'dont-pop-it',
    ];
    return allGames.filter((g) => popularIds.includes(g.id));
  }, [allGames]);

  // Live instant search matches
  const searchMatches = useMemo(() => {
    const query = homeSearch.trim().toLowerCase();
    if (!query) return [];
    return allGames.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.tags.some((t) => t.toLowerCase().includes(query)),
    );
  }, [allGames, homeSearch]);

  return (
    <div className="flex flex-col gap-12">
      {/* 1. Hero: "PLAY SOMETHING" */}
      <section className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-raised p-8 md:p-12 shadow-sm">
        <div className="flex flex-col items-start gap-4 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Arcade Hub</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-deck-950 dark:text-white font-display uppercase leading-tight">
            PLAY SOMETHING.
          </h1>

          <div className="shelf-line w-24 my-1" />

          <p className="text-lg text-deck-600 dark:text-deck-300 font-medium">
            Pick a game. Start playing.
          </p>
          <p className="text-sm text-deck-500 max-w-md">
            Built from the ground up for instantaneous local play, with modular plugin architecture
            and future-ready multiplayer session contracts.
          </p>

          <div className="flex items-center gap-4 mt-2">
            <Link href="/games">
              <Button variant="primary" size="lg" className="gap-2">
                <Compass className="w-4 h-4" />
                <span>Browse Games</span>
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="outline" size="lg">
                View Shelf
              </Button>
            </Link>
          </div>

          {/* Quick Search & Filter Bar */}
          <div className="w-full max-w-lg mt-3 flex flex-col gap-2.5">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-deck-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                placeholder="Search Stickman, puzzle, arcade games..."
                className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl border border-surface-border bg-surface-base text-deck-950 dark:text-white placeholder-deck-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors shadow-inner"
              />
              {homeSearch && (
                <button
                  onClick={() => setHomeSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-deck-400 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick category pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-deck-500 text-[11px] font-medium mr-1">Quick:</span>
              <Link
                href="/games?category=arcade"
                className="px-2.5 py-1 rounded-lg bg-surface-base hover:bg-surface-overlay border border-surface-border text-deck-400 hover:text-white text-[11px] transition-colors"
              >
                🕹️ Arcade
              </Link>
              <Link
                href="/games?category=puzzle"
                className="px-2.5 py-1 rounded-lg bg-surface-base hover:bg-surface-overlay border border-surface-border text-deck-400 hover:text-white text-[11px] transition-colors"
              >
                🧩 Puzzle
              </Link>
              <Link
                href="/games?category=strategy"
                className="px-2.5 py-1 rounded-lg bg-surface-base hover:bg-surface-overlay border border-surface-border text-deck-400 hover:text-white text-[11px] transition-colors"
              >
                ♟️ Strategy
              </Link>
              <Link
                href="/games?mode=multiplayer"
                className="px-2.5 py-1 rounded-lg bg-surface-base hover:bg-surface-overlay border border-surface-border text-deck-400 hover:text-white text-[11px] transition-colors"
              >
                👥 Multiplayer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Search Results if active */}
      {homeSearch.trim() !== '' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-deck-950 dark:text-white font-display">
              Matching Games ({searchMatches.length})
            </h2>
            <button
              onClick={() => setHomeSearch('')}
              className="text-xs text-amber-500 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
          {searchMatches.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-surface-border bg-surface-raised">
              <p className="text-sm text-deck-400">No games matched &quot;{homeSearch}&quot;.</p>
              <button
                onClick={() => setHomeSearch('')}
                className="mt-2 text-xs text-amber-500 font-bold hover:underline cursor-pointer"
              >
                Reset search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {searchMatches.map((game) => (
                <GameCard key={game.id} game={game} layout="standard" />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. STICKMAN GAMES Signature Series */}
      {stickmanGames.length > 0 && homeSearch.trim() === '' && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Swords className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-wider text-deck-950 dark:text-white font-display flex items-center gap-2">
                  <span>Stickman Games</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                    Signature Series
                  </span>
                </h2>
                <p className="text-xs text-deck-500">
                  Tactile action, physics combat, and high-score runs in the Stickman universe.
                </p>
              </div>
            </div>
            <Link
              href="/games?category=arcade"
              className="text-xs text-deck-500 hover:text-amber-500 flex items-center gap-1 transition-colors self-start sm:self-auto font-medium"
            >
              <span>View all arcade</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stickmanGames.map((game) => (
              <GameCard key={game.id} game={game} layout="standard" />
            ))}
          </div>
        </section>
      )}

      {/* 3. Featured Highlight Spotlights */}
      {featuredGames.length > 0 && homeSearch.trim() === '' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <h2 className="text-xs font-bold uppercase tracking-wider text-deck-500 font-display">
              Featured Spotlights
            </h2>
            <Link
              href="/games"
              className="text-xs text-deck-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredGames.slice(0, 4).map((game) => (
              <GameCard key={game.id} game={game} layout="featured" />
            ))}
          </div>
        </section>
      )}

      {/* 4. POPULAR & TRENDING TITLES */}
      {popularGames.length > 0 && homeSearch.trim() === '' && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-deck-950 dark:text-white font-display">
                Popular &amp; Trending Titles
              </h2>
            </div>
            <Link
              href="/games"
              className="text-xs text-deck-500 hover:text-amber-500 flex items-center gap-1 transition-colors font-medium"
            >
              <span>Explore all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularGames.map((game) => (
              <GameCard key={game.id} game={game} layout="standard" />
            ))}
          </div>
        </section>
      )}

      {/* 5. YOUR LIBRARY / Game Shelf Section */}
      <section className="flex flex-col gap-6 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-deck-900 dark:text-deck-100 font-display">
              YOUR LIBRARY
            </h2>
          </div>
          <span className="text-xs text-deck-400">
            {recentSessions.length > 0 ? `${recentSessions.length} Recent Sessions` : 'Empty Shelf'}
          </span>
        </div>

        {recentSessions.length === 0 ? (
          <EmptyShelf
            title="Your game shelf is waiting."
            description="Games will appear here as they're added to PlayDeck."
            actionText="Explore games"
            actionHref="/games"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentSessions.map((session) => {
              const matchedGame = allGames.find(
                (g) => g.id === session.gameId || g.slug === session.gameId,
              );
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-xl border border-surface-border bg-surface-raised hover:border-surface-borderHover transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-deck-400 mb-2">
                      <span className="capitalize px-1.5 py-0.5 rounded bg-surface-overlay text-[10px] font-semibold border border-surface-border">
                        {session.status}
                      </span>
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-sm text-deck-900 dark:text-white capitalize mb-1">
                      {matchedGame ? matchedGame.name : session.gameId}
                    </h4>
                    <p className="text-xs text-deck-500">
                      Session:{' '}
                      <span className="font-mono text-[11px]">{session.id.slice(0, 14)}...</span>
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
                    <Link
                      href={`/play/${matchedGame ? matchedGame.slug : session.gameId}`}
                      className="text-xs text-amber-500 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Resume Game</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
