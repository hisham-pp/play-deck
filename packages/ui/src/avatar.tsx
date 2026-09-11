import React from 'react';
import { cn } from './utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'in-game' | 'offline';
}

const AVATAR_SIZES = {
  sm: 'w-7 h-7 text-sm',
  md: 'w-9 h-9 text-base',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-16 h-16 text-3xl',
};

const STATUS_COLORS = {
  online: 'bg-emerald-500',
  'in-game': 'bg-amber-500',
  offline: 'bg-deck-400',
};

export function Avatar({ className, src, fallback, size = 'md', status, ...props }: AvatarProps) {
  return (
    <div className="relative inline-block select-none">
      <div
        className={cn(
          'rounded-full border border-surface-border bg-surface-overlay flex items-center justify-center overflow-hidden font-display',
          AVATAR_SIZES[size],
          className,
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={fallback} className="w-full h-full object-cover" />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface-base',
            STATUS_COLORS[status],
          )}
        />
      )}
    </div>
  );
}
