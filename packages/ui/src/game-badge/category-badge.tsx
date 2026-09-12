import { Gamepad2, Swords, Puzzle, LayoutGrid, Layers, Sparkles } from 'lucide-react';
import React from 'react';
import { cn } from '../utils';
import { BADGE_ICON_CLASS, BADGE_SIZES, BaseBadgeProps, GameCategoryType } from './types';

export interface GameCategoryBadgeProps extends BaseBadgeProps {
  category?: GameCategoryType;
  showIcon?: boolean;
}

export function GameCategoryBadge({
  category = 'arcade',
  label,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: GameCategoryBadgeProps) {
  const categoryLabel = label || category.charAt(0).toUpperCase() + category.slice(1);

  const categoryIcons: Record<GameCategoryType, React.ReactNode> = {
    arcade: <Gamepad2 className={cn(BADGE_ICON_CLASS, 'text-amber-500')} />,
    strategy: <Swords className={cn(BADGE_ICON_CLASS, 'text-blue-400')} />,
    puzzle: <Puzzle className={cn(BADGE_ICON_CLASS, 'text-emerald-400')} />,
    board: <LayoutGrid className={cn(BADGE_ICON_CLASS, 'text-amber-400')} />,
    card: <Layers className={cn(BADGE_ICON_CLASS, 'text-rose-400')} />,
    casual: <Sparkles className={cn(BADGE_ICON_CLASS, 'text-purple-400')} />,
    all: <Sparkles className={cn(BADGE_ICON_CLASS, 'text-amber-400')} />,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium border border-surface-border bg-surface-overlay text-deck-700 dark:text-deck-300 transition-colors select-none',
        BADGE_SIZES[size],
        className,
      )}
      {...props}
    >
      {showIcon && (categoryIcons[category] || <Gamepad2 className={BADGE_ICON_CLASS} />)}
      <span>{categoryLabel}</span>
    </span>
  );
}
