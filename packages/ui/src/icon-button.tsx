'use client';

import React from 'react';
import { cn } from './utils';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
}

const ICON_VARIANTS = {
  primary: 'bg-amber-500 text-slate-950 hover:bg-amber-400 active:bg-amber-600',
  secondary:
    'bg-surface-raised border border-surface-border text-deck-600 dark:text-deck-300 hover:bg-surface-overlay hover:text-deck-950 dark:hover:text-white',
  outline:
    'border border-surface-border bg-transparent hover:bg-surface-overlay text-deck-600 dark:text-deck-300',
  ghost: 'text-deck-500 hover:text-deck-900 dark:hover:text-white hover:bg-surface-overlay',
};

const ICON_SIZES = {
  sm: 'w-7 h-7 p-1 text-xs',
  md: 'w-9 h-9 p-2 text-sm',
  lg: 'w-11 h-11 p-2.5 text-base',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95',
          ICON_VARIANTS[variant],
          ICON_SIZES[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

IconButton.displayName = 'IconButton';
