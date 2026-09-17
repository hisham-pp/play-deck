'use client';

import { ArrowRight, Info, Play, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Card } from '@/components/ui/Card';
import { GameStatusBadge, GameCategoryBadge } from './GameBadge';

export function StandardGameCard({ game }: { game: GameDefinition }) {
  const router = useRouter();
  const isAvailable = game.status === 'available';

  const handleCardClick = (e: React.MouseEvent) => {
    // If user clicked inside an anchor or button (like the Details link), let it handle its own navigation
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }

    if (isAvailable) {
      router.push(`/play/${game.id}`);
    } else {
      router.push(`/games/${game.id}`);
    }
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="flex flex-col justify-between overflow-hidden group border-surface-border hover:border-amber-500/50 bg-surface-raised transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 select-none"
    >
      {/* 1. Cover Artwork Banner with Arcade Hover Play Button */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-overlay border-b border-surface-border">
        {game.bannerUrl ? (
          <img
            src={game.bannerUrl}
            alt={`${game.name} cover`}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : game.thumbnailUrl ? (
          <div className="w-full h-full flex items-center justify-center p-8 bg-surface-base">
            <img
              src={game.thumbnailUrl}
              alt={`${game.name} icon`}
              className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-surface-base">
            🎮
          </div>
        )}

        {/* Gradient shadow for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-transparent to-black/30 pointer-events-none" />

        {/* Badges pinned to corners */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          <GameStatusBadge status={game.status} label={game.badge} size="xs" />
          <GameCategoryBadge category={game.category} size="xs" />
        </div>

        {/* Hover Overlay with Arcade "PLAY NOW" Button */}
        {isAvailable ? (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 z-20">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/40 group-hover:scale-110 transition-transform duration-200">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 drop-shadow">
              Click to Play
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
            <span className="text-xs font-bold text-deck-400 bg-surface-base/90 px-3 py-1.5 rounded border border-surface-border">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-base font-bold text-deck-950 dark:text-white font-display group-hover:text-amber-500 transition-colors">
              {game.name}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-deck-400 bg-surface-base px-2 py-0.5 rounded border border-surface-border flex-shrink-0">
              <Users className="w-3 h-3 text-deck-500" />
              <span>
                {game.players.min === game.players.max
                  ? `${game.players.min}P`
                  : `${game.players.min}-${game.players.max}P`}
              </span>
            </div>
          </div>

          <p className="text-xs text-deck-500 dark:text-deck-400 line-clamp-2 leading-relaxed mb-3">
            {game.description}
          </p>
        </div>

        {/* Tag Pills */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-surface-overlay text-deck-400 border border-surface-border"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 3. Footer Actions */}
      <div className="p-2.5 px-4 border-t border-surface-border bg-surface-overlay/40 flex items-center justify-between">
        <Link
          href={`/games/${game.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-deck-400 hover:text-white font-medium inline-flex items-center gap-1 transition-colors py-1"
        >
          <Info className="w-3 h-3 text-deck-500" />
          <span>Details</span>
        </Link>

        {isAvailable ? (
          <Link
            href={`/play/${game.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors py-1"
          >
            <span>Play Game</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-xs text-deck-500 italic">Coming soon</span>
        )}
      </div>
    </Card>
  );
}
