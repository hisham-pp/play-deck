import React from 'react';
import { cn } from './utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'text';
}

const SKELETON_VARIANTS = {
  rectangular: 'rounded-lg',
  circular: 'rounded-full',
  text: 'rounded h-3 w-full',
};

export function Skeleton({ className, variant = 'rectangular', ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-overlay border border-surface-border/50',
        SKELETON_VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
