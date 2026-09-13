'use client';

import { ArrowRight, Play, Users } from 'lucide-react';
import React from 'react';
import type { GameDefinition } from '@playdeck/game-types';
import { GameCategoryBadge, GameStatusBadge } from '@/components/game/GameBadge';
import { cn } from '@/lib/utils';

interface SearchResultItemProps {
  game: GameDefinition;
  isSelected: boolean;
  onSelect: () => void;
  onLaunch: (game: GameDefinition, preferDetails?: boolean) => void;
  itemRef: (el: HTMLDivElement | null) => void;
}

export function SearchResultItem({
  game,
  isSelected,
  onSelect,
  onLaunch,
  itemRef,
}: SearchResultItemProps) {
  const isAvailable = game.status === 'available';

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLaunch(game, true);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLaunch(game, false);
  };

  return (
    <div
      id={`game-item-${game.id}`}
      role="option"
      aria-selected={isSelected}
      ref={itemRef}
      onMouseEnter={onSelect}
      onClick={() => onLaunch(game)}
      className={cn(
        'flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-all border',
        isSelected
          ? 'bg-amber-500/10 border-amber-500/40 text-deck-950 dark:text-white shadow-sm'
          : 'border-transparent hover:bg-surface-overlay/80 text-deck-800 dark:text-deck-200',
      )}
    >
      {/* Left: Thumbnail & Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div
          className={cn(
            'w-11 h-11 rounded-lg border flex items-center justify-center p-1.5 shrink-0 text-xl transition-transform overflow-hidden',
            isSelected
              ? 'border-amber-500/50 bg-surface-overlay scale-105'
              : 'border-surface-border bg-surface-overlay',
          )}
        >
          {game.thumbnailUrl ? (
            <img
              src={game.thumbnailUrl}
              alt={`${game.name} icon`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <span>🎮</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-sm sm:text-base font-display truncate">
              {game.name}
            </span>
            <GameCategoryBadge category={game.category} size="xs" />
            <GameStatusBadge status={game.status} label={game.badge} size="xs" />
          </div>

          <p className="text-xs text-deck-500 dark:text-deck-400 line-clamp-1">
            {game.description}
          </p>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-deck-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {game.players.min === game.players.max
                ? `${game.players.min}P`
                : `${game.players.min}-${game.players.max}P`}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1 overflow-hidden truncate">
              {game.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.2 rounded bg-surface-overlay text-deck-400 border border-surface-border/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isAvailable ? (
          <button
            type="button"
            onClick={handlePlayClick}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors',
              isSelected
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-surface-overlay border border-surface-border text-amber-400 hover:bg-amber-500 hover:text-slate-950',
            )}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Play</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleDetailsClick}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-surface-overlay border border-surface-border text-deck-400 hover:text-white"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
