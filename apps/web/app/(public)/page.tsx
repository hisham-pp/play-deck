'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GameDefinition } from '@playdeck/game-types';
import { gameService } from '@/features/games/services/game-service';
import { useLibraryStore } from '@/stores/library.store';
import { Button } from '@/components/ui/Button';
import { EmptyShelf } from '@/components/game/EmptyShelf';
import { GameCard } from '@/components/game/GameCard';
import { ArrowRight, Compass, Sparkles, Trophy } from 'lucide-react';

export default function HomePage() {
  const [featuredGames, setFeaturedGames] = useState<GameDefinition[]>([]);
  const { recentSessions, initLibrary, isInitialized } = useLibraryStore();

  useEffect(() => {
    initLibrary();
    gameService.getFeaturedGames().then(setFeaturedGames);
  }, [initLibrary]);

  return (
    <div className="flex flex-col gap-12">
      {/* Hero: "PLAY SOMETHING" */}
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

          <div className="flex items-center gap-4 mt-4">
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
        </div>
      </section>

      {/* Featured Highlight if available */}
      {featuredGames.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
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
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} layout="featured" />
            ))}
          </div>
        </section>
      )}

      {/* YOUR LIBRARY / Game Shelf Section */}
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
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-lg border border-surface-border bg-surface-raised hover:border-surface-borderHover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-deck-400 mb-2">
                    <span className="capitalize">{session.status}</span>
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-sm text-deck-900 dark:text-white capitalize mb-1">
                    {session.gameId}
                  </h4>
                  <p className="text-xs text-deck-500">
                    Session: <span className="font-mono text-[11px]">{session.id.slice(0, 14)}...</span>
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
                  <Link
                    href={`/play/${session.gameId}`}
                    className="text-xs text-amber-500 font-medium hover:underline"
                  >
                    Resume Game →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
