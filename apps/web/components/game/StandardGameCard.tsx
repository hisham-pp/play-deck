import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function StandardGameCard({ game }: { game: GameDefinition }) {
  const isAvailable = game.status === 'available';

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
