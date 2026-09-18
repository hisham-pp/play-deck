import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import type { GameDefinition } from '@playdeck/game-types';
import { gameOverviewPath } from '@/lib/seo/site';

const MAX_RELATED = 4;

/**
 * Picks siblings for internal linking: same category first, then anything else
 * available, so every game page always links out to `MAX_RELATED` others.
 */
export function pickRelatedGames(
  game: GameDefinition,
  all: GameDefinition[],
  limit = MAX_RELATED,
): GameDefinition[] {
  const candidates = all.filter((other) => other.id !== game.id && other.status === 'available');
  const sameCategory = candidates.filter((other) => other.category === game.category);
  const rest = candidates.filter((other) => other.category !== game.category);

  return [...sameCategory, ...rest].slice(0, limit);
}

interface RelatedGamesProps {
  games: GameDefinition[];
  heading?: string;
}

export function RelatedGames({ games, heading = 'More games like this' }: RelatedGamesProps) {
  if (!games.length) return null;

  return (
    <section
      id="related"
      className="rounded-2xl border border-surface-border bg-surface-raised p-6 md:p-8"
    >
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-lg md:text-xl font-black font-display text-deck-950 dark:text-white">
          {heading}
        </h2>
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors"
        >
          All games
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {games.map((game) => (
          <li key={game.id}>
            <Link
              href={gameOverviewPath(game.slug)}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-overlay border border-surface-border hover:border-amber-500/50 transition-colors"
            >
              <span className="w-11 h-11 rounded-lg bg-surface-base border border-surface-border flex items-center justify-center p-1.5 flex-shrink-0 overflow-hidden">
                {game.thumbnailUrl ? (
                  <img
                    src={game.thumbnailUrl}
                    alt=""
                    aria-hidden
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </span>
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-bold text-deck-900 dark:text-white truncate">
                  {game.name}
                </span>
                <span className="text-[11px] text-deck-500 line-clamp-1">{game.description}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
