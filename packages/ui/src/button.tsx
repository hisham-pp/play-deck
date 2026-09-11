'use client';

import React from 'react';
import { cn } from './utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'arcade';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

const BASE_STYLES =
  'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

const VARIANTS = {
  primary:
    'bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold shadow-sm hover:shadow active:bg-amber-600',
  secondary:
    'bg-deck-100 text-deck-900 hover:bg-deck-200 dark:bg-deck-800 dark:text-deck-100 dark:hover:bg-deck-700 border border-surface-border',
  outline:
    'border border-surface-border hover:border-surface-borderHover bg-transparent hover:bg-surface-overlay text-deck-800 dark:text-deck-200',
  ghost:
    'hover:bg-surface-overlay text-deck-700 dark:text-deck-300 hover:text-deck-900 dark:hover:text-white',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700',
  arcade:
    'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 font-bold tracking-wider uppercase border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5 shadow-arcade',
};

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-base px-6 py-2.5 gap-2.5',
  icon: 'p-2 w-9 h-9',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(BASE_STYLES, VARIANTS[variant], SIZES[size], className)}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
