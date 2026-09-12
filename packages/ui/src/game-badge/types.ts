import React from 'react';

export type GameStatusType = 'available' | 'coming-soon' | 'maintenance';
export type GameCategoryType =
  'arcade' | 'strategy' | 'puzzle' | 'board' | 'card' | 'casual' | 'all';
export type GameFeatureType = 'offline' | 'multiplayer' | 'featured' | 'instant';

export interface BaseBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const BADGE_SIZES = {
  xs: 'text-[10px] px-2 py-0.5 gap-1',
  sm: 'text-xs px-2.5 py-1 gap-1.5',
  md: 'text-xs px-3 py-1.5 gap-2 font-semibold',
};

export const BADGE_ICON_CLASS = 'w-3.5 h-3.5';
