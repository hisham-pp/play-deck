import { Gamepad2, Radio, ShieldCheck, Sparkles, Users } from 'lucide-react';
import React from 'react';
import { cn } from '../utils';
import { BADGE_ICON_CLASS, BADGE_SIZES, BaseBadgeProps, GameFeatureType } from './types';

export interface GameFeatureBadgeProps extends BaseBadgeProps {
  feature?: GameFeatureType;
  showIcon?: boolean;
}

export function GameFeatureBadge({
  feature = 'offline',
  label,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: GameFeatureBadgeProps) {
  const featureConfigs: Record<
    GameFeatureType,
    { label: string; icon: React.ReactNode; style: string }
  > = {
    offline: {
      label: 'Offline Ready',
      icon: <ShieldCheck className={cn(BADGE_ICON_CLASS, 'text-emerald-500')} />,
      style: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
    },
    multiplayer: {
      label: 'Multiplayer Ready',
      icon: <Radio className={cn(BADGE_ICON_CLASS, 'text-indigo-400')} />,
      style: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-700 dark:text-indigo-300',
    },
    featured: {
      label: 'Featured Spotlight',
      icon: <Sparkles className={cn(BADGE_ICON_CLASS, 'text-amber-500')} />,
      style: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    instant: {
      label: 'Instant Play',
      icon: <Gamepad2 className={cn(BADGE_ICON_CLASS, 'text-amber-500')} />,
      style: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    },
  };

  const config = featureConfigs[feature];
  const featureLabel = label || config.label;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium border transition-colors select-none',
        config.style,
        BADGE_SIZES[size],
        className,
      )}
      {...props}
    >
      {showIcon && config.icon}
      <span>{featureLabel}</span>
    </span>
  );
}

export interface GamePlayersBadgeProps extends BaseBadgeProps {
  players: { min: number; max: number };
  showIcon?: boolean;
}

export function GamePlayersBadge({
  players,
  label,
  size = 'sm',
  showIcon = true,
  className,
  ...props
}: GamePlayersBadgeProps) {
  const playerText =
    players.min === players.max
      ? `${players.min} ${players.min === 1 ? 'Player' : 'Players'}`
      : `${players.min} - ${players.max} Players`;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-medium border border-surface-border bg-surface-overlay text-deck-600 dark:text-deck-400 transition-colors select-none',
        BADGE_SIZES[size],
        className,
      )}
      {...props}
    >
      {showIcon && <Users className={cn(BADGE_ICON_CLASS, 'text-deck-400')} />}
      <span>{label || playerText}</span>
    </span>
  );
}
