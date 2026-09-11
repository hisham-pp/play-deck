import { Users, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function FeaturedGameCard({ game }: { game: GameDefinition }) {
  const isAvailable = game.status === 'available';

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
