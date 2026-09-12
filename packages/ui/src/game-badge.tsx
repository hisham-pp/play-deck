import React from 'react';
import { GameCategoryBadge } from './game-badge/category-badge';
import { GameFeatureBadge, GamePlayersBadge } from './game-badge/feature-badge';
import { GameStatusBadge } from './game-badge/status-badge';
import {
  BaseBadgeProps,
  GameCategoryType,
  GameFeatureType,
  GameStatusType,
} from './game-badge/types';

export * from './game-badge/types';
export * from './game-badge/status-badge';
export * from './game-badge/category-badge';
export * from './game-badge/feature-badge';

export interface GameBadgeProps extends BaseBadgeProps {
  variant?: 'status' | 'category' | 'feature' | 'players';
  status?: GameStatusType;
  category?: GameCategoryType;
  feature?: GameFeatureType;
  players?: { min: number; max: number };
  showIcon?: boolean;
  pulse?: boolean;
}

export function GameBadge({
  variant = 'status',
  status,
  category,
  feature,
  players,
  ...props
}: GameBadgeProps) {
  if (variant === 'status') {
    return <GameStatusBadge status={status} {...props} />;
  }

  if (variant === 'category') {
    return <GameCategoryBadge category={category} {...props} />;
  }

  if (variant === 'feature') {
    return <GameFeatureBadge feature={feature} {...props} />;
  }

  if (variant === 'players' && players) {
    return <GamePlayersBadge players={players} {...props} />;
  }

  return null;
}
