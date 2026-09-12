import { Clock, Gamepad2, Wrench } from 'lucide-react';
import React from 'react';
import { cn } from '../utils';
import { BADGE_ICON_CLASS, BADGE_SIZES, BaseBadgeProps, GameStatusType } from './types';

export interface GameStatusBadgeProps extends BaseBadgeProps {
  status?: GameStatusType;
  pulse?: boolean;
  showIcon?: boolean;
}

export function GameStatusBadge({
  status = 'available',
  label,
  size = 'sm',
  pulse = true,
  showIcon = true,
  className,
  ...props
}: GameStatusBadgeProps) {
  const isAvailable = status === 'available';
  const isComingSoon = status === 'coming-soon';
  const statusLabel =
    label || (isAvailable ? 'Ready to Play' : isComingSoon ? 'Coming Soon' : 'Maintenance');

  const statusStyles = isAvailable
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    : isComingSoon
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
      : 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400';

  const dotColor = isAvailable ? 'bg-emerald-500' : isComingSoon ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium border uppercase tracking-wider transition-all select-none',
        statusStyles,
        BADGE_SIZES[size],
        className,
      )}
      {...props}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              dotColor,
            )}
          />
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColor)} />
        </span>
      ) : showIcon ? (
        isAvailable ? (
          <Gamepad2 className={BADGE_ICON_CLASS} />
        ) : isComingSoon ? (
          <Clock className={BADGE_ICON_CLASS} />
        ) : (
          <Wrench className={BADGE_ICON_CLASS} />
        )
      ) : null}
      <span>{statusLabel}</span>
    </span>
  );
}
