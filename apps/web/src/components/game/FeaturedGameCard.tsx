'use client';

import { Play, Sparkles, Users, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Card } from '@/components/ui/Card';
import { GameStatusBadge, GameCategoryBadge } from './GameBadge';

export function FeaturedGameCard({ game }: { game: GameDefinition }) {
  const router = useRouter();
  const isAvailable = game.status === 'available';

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    if (isAvailable) {
      router.push(`/play/${game.slug}`);
    } else {
      router.push(`/games/${game.slug}`);
    }
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="relative overflow-hidden group border-surface-border hover:border-amber-500/50 bg-surface-raised transition-all duration-300 select-none shadow-md hover:shadow-xl hover:shadow-amber-500/10"
    >
      {/* Background artwork banner layer with subtle parallax & gradient overlay */}
      {game.bannerUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-25 group-hover:opacity-35 transition-opacity duration-500">
          <img
            src={game.bannerUrl}
            alt=""
            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-raised via-surface-raised/95 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-surface-raised/80" />
        </div>
      )}

      <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full min-h-[320px]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2">
              <GameStatusBadge status={game.status} label={game.badge} />
              <GameCategoryBadge category={game.category} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-deck-950 dark:text-white font-display mt-1 group-hover:text-amber-500 transition-colors">
              {game.name}
            </h3>
            <p className="text-sm text-deck-600 dark:text-deck-300 leading-relaxed mt-1">
              {game.description}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-surface-overlay/80 backdrop-blur-sm border border-surface-border flex items-center justify-center p-2.5 text-3xl group-hover:scale-110 transition-transform flex-shrink-0 overflow-hidden shadow-sm">
            {game.thumbnailUrl ? (
              <img
                src={game.thumbnailUrl}
                alt={`${game.name} icon`}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : game.category === 'strategy' ? (
              '♟️'
            ) : game.category === 'arcade' ? (
              '🕹️'
            ) : (
              '🧩'
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-surface-border mt-6">
          <div className="flex items-center gap-4 text-xs text-deck-500">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-deck-400" />
              <span>
                {game.players.min === game.players.max
                  ? `${game.players.min} Players`
                  : `${game.players.min} - ${game.players.max} Players`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Featured Game</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/games/${game.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-deck-600 dark:text-deck-300 hover:text-deck-950 dark:hover:text-white transition-colors inline-flex items-center gap-1 py-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>

            {isAvailable ? (
              <Link
                href={`/play/${game.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md group-hover:scale-105 shadow-amber-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Now</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-overlay border border-surface-border text-deck-400 text-xs font-medium cursor-not-allowed">
                Coming Soon
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
