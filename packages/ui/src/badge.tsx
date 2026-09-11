import React from 'react';
import { cn } from './utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'neutral' | 'arcade';
  size?: 'sm' | 'md';
}

const BADGE_VARIANTS = {
  default: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  outline: 'border-surface-border text-deck-600 dark:text-deck-400 bg-surface-overlay',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
  neutral:
    'bg-deck-200/50 text-deck-700 dark:bg-deck-800/60 dark:text-deck-300 border-surface-border',
  arcade:
    'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/40 font-bold',
};

const BADGE_SIZES = {
  sm: 'text-[11px] px-2 py-0.5 font-medium tracking-wide uppercase',
  md: 'text-xs px-2.5 py-1 font-medium',
};

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border transition-colors select-none',
        BADGE_VARIANTS[variant],
        BADGE_SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
