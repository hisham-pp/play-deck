import { Play, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import type { GameDefinition } from '@playdeck/game-types';
import {
  GameStatusBadge,
  GameCategoryBadge,
  GamePlayersBadge,
  GameFeatureBadge,
} from './GameBadge';

interface GameTemplateHeaderProps {
  game: GameDefinition;
  /** Session launcher URL. Rendered as a real anchor so crawlers follow it. */
  playHref: string;
  backHref?: string;
  tagline?: string;
}

export function GameTemplateHeader({
  game,
  playHref,
  backHref = '/games',
  tagline,
}: GameTemplateHeaderProps) {
  const isAvailable = game.status === 'available';

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs font-medium text-deck-500">
          <li>
            <Link href="/" className="hover:text-deck-900 dark:hover:text-white transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 hover:text-deck-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Games
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-deck-900 dark:text-white">
            {game.name}
          </li>
        </ol>
      </nav>

      <div className="rounded-2xl border border-surface-border bg-surface-raised p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center p-2 text-3xl flex-shrink-0 overflow-hidden shadow-inner">
            {game.thumbnailUrl ? (
              <img
                src={game.thumbnailUrl}
                alt={`${game.name} icon`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Sparkles className="w-8 h-8 text-amber-500" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <GameStatusBadge status={game.status} label={game.badge} />
              <GameCategoryBadge category={game.category} />
              <GamePlayersBadge players={game.players} />
              <GameFeatureBadge feature="offline" />
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-deck-950 dark:text-white font-display">
              {game.name}
            </h1>
            <p className="text-xs text-deck-500 max-w-xl leading-relaxed">
              {tagline ?? game.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isAvailable ? (
            <Link
              href={playHref}
              className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-deck-950 font-bold text-sm transition-colors shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play {game.name}</span>
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center w-full md:w-auto px-6 h-12 rounded-xl border border-surface-border text-deck-500 font-bold text-sm opacity-60">
              Coming Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
