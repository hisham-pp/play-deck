'use client';

import { Play, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Button } from '@/components/ui/Button';
import {
  GameStatusBadge,
  GameCategoryBadge,
  GamePlayersBadge,
  GameFeatureBadge,
} from './GameBadge';

interface GameTemplateHeaderProps {
  game: GameDefinition;
  onPlay?: () => void;
  backHref?: string;
}

export function GameTemplateHeader({ game, onPlay, backHref = '/games' }: GameTemplateHeaderProps) {
  const isAvailable = game.status === 'available';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-xs font-medium text-deck-500 hover:text-deck-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

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
            <p className="text-xs text-deck-500 max-w-xl leading-relaxed">{game.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isAvailable ? (
            <Button onClick={onPlay} variant="primary" size="lg" className="w-full md:w-auto gap-2">
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Session</span>
            </Button>
          ) : (
            <Button variant="outline" size="lg" disabled className="w-full md:w-auto opacity-60">
              Coming Soon
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
