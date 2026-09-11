import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { Badge } from '@/components/ui/Badge';

export function CompactGameCard({ game }: { game: GameDefinition }) {
  const isAvailable = game.status === 'available';

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
