'use client';

import { ArrowRight, Play, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { GameDefinition } from '@playdeck/game-types';
import { usePlayerStore } from '@/stores/player.store';
import { GameStatusBadge } from './GameBadge';

export function CompactGameCard({ game }: { game: GameDefinition }) {
  const router = useRouter();
  const isAvailable = game.status === 'available';
  const bestScore = usePlayerStore(
    (s) => s.stats.bestScores?.[game.id] ?? s.stats.bestScores?.[game.slug],
  );

  const handleClick = (e: React.MouseEvent) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isAvailable) {
        router.push(`/play/${game.slug}`);
      } else {
        router.push(`/games/${game.slug}`);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${game.name} - ${isAvailable ? 'Play Game' : 'Coming Soon'}`}
      className="flex items-center justify-between p-3.5 rounded-xl border border-surface-border bg-surface-raised hover:border-amber-500/40 hover:bg-surface-overlay focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-all duration-200 group cursor-pointer select-none"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-surface-base border border-surface-border flex items-center justify-center p-1.5 text-lg group-hover:scale-105 transition-transform overflow-hidden flex-shrink-0">
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
        <div>
          <h4 className="text-sm font-bold text-deck-950 dark:text-deck-100 group-hover:text-amber-500 transition-colors">
            {game.name}
          </h4>
          <div className="flex items-center gap-2 text-[11px] text-deck-500 mt-0.5">
            <span className="capitalize">{game.category}</span>
            <span>•</span>
            <span>{game.players.max === 1 ? 'Solo' : `${game.players.max} Players`}</span>
            {bestScore !== undefined && bestScore > 0 && (
              <>
                <span>•</span>
                <span className="text-amber-400 font-mono font-bold flex items-center gap-0.5">
                  <Trophy className="w-2.5 h-2.5 text-amber-500" />
                  {bestScore.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <GameStatusBadge status={game.status} label={isAvailable ? 'Playable' : 'Soon'} size="xs" />

        <Link
          href={`/games/${game.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-deck-500 hover:text-white transition-colors hidden sm:inline"
        >
          Details
        </Link>

        {isAvailable ? (
          <Link
            href={`/play/${game.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-all shadow-sm"
            title="Play Game"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </Link>
        ) : (
          <ArrowRight className="w-4 h-4 text-deck-500" />
        )}
      </div>
    </div>
  );
}
