import React from 'react';
import Link from 'next/link';
import { GameDefinition } from '@playdeck/game-types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, ArrowRight, Play, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: GameDefinition;
  layout?: 'standard' | 'featured' | 'compact';
}

export function GameCard({ game, layout = 'standard' }: GameCardProps) {
  const isAvailable = game.status === 'available';

  if (layout === 'featured') {
    return (
      <Card
        hoverable
        className="relative overflow-hidden group border-surface-border bg-surface-raised transition-all duration-300"
      >
        <div className="p-6 md:p-8 flex flex-col justify-between h-full min-h-[320px]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={isAvailable ? 'success' : 'warning'}>
                  {game.badge || (isAvailable ? 'Ready' : 'Coming Soon')}
                </Badge>
                <Badge variant="outline">{game.category}</Badge>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-deck-950 dark:text-white font-display mt-1">
                {game.name}
              </h3>
              <p className="text-sm text-deck-600 dark:text-deck-300 max-w-xl leading-relaxed mt-1">
                {game.description}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
              {game.category === 'strategy' ? '♟️' : game.category === 'arcade' ? '🕹️' : '🧩'}
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
              <Link href={`/games/${game.id}`}>
                <span className="text-xs font-semibold text-deck-600 dark:text-deck-300 hover:text-deck-950 dark:hover:text-white transition-colors">
                  Overview
                </span>
              </Link>
              {isAvailable ? (
                <Link
                  href={`/play/${game.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-sm group-hover:shadow"
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

  if (layout === 'compact') {
    return (
      <Link href={`/games/${game.id}`} className="block">
        <div className="flex items-center justify-between p-3.5 rounded-lg border border-surface-border bg-surface-raised hover:border-surface-borderHover hover:bg-surface-overlay transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-surface-overlay border border-surface-border flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
              {game.category === 'strategy' ? '♟️' : game.category === 'arcade' ? '🕹️' : '🧩'}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-deck-950 dark:text-deck-100 group-hover:text-amber-500 transition-colors">
                {game.name}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-deck-500">
                <span className="capitalize">{game.category}</span>
                <span>•</span>
                <span>{game.players.max}p</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={isAvailable ? 'success' : 'neutral'} size="sm">
              {isAvailable ? 'Playable' : 'Soon'}
            </Badge>
            <ArrowRight className="w-4 h-4 text-deck-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    );
  }

  // Standard Card Layout
  return (
    <Card
      hoverable
      className="flex flex-col justify-between overflow-hidden group border-surface-border bg-surface-raised transition-all"
    >
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <Badge variant={isAvailable ? 'success' : 'neutral'}>
            {game.badge || (isAvailable ? 'Available' : 'Soon')}
          </Badge>
          <span className="text-xs text-deck-400 capitalize">{game.category}</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-surface-overlay border border-surface-border flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            {game.category === 'strategy' ? '♟️' : game.category === 'arcade' ? '🕹️' : '🧩'}
          </div>
          <div>
            <h4 className="text-base font-bold text-deck-950 dark:text-deck-100 font-display group-hover:text-amber-500 transition-colors">
              {game.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-deck-500">
              <Users className="w-3.5 h-3.5" />
              <span>
                {game.players.min === game.players.max
                  ? `${game.players.min} player`
                  : `${game.players.min}-${game.players.max} players`}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-deck-600 dark:text-deck-400 line-clamp-2 leading-relaxed mb-4 flex-1">
          {game.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded bg-surface-overlay text-deck-500 border border-surface-border"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 px-5 border-t border-surface-border bg-surface-overlay/50 flex items-center justify-between">
        <Link
          href={`/games/${game.id}`}
          className="text-xs text-deck-600 dark:text-deck-400 hover:text-deck-900 dark:hover:text-white font-medium"
        >
          Details
        </Link>
        {isAvailable ? (
          <Link
            href={`/play/${game.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            <span>Play</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="text-xs text-deck-400 italic">Coming soon</span>
        )}
      </div>
    </Card>
  );
}
