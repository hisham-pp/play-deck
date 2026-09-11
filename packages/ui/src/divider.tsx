import React from 'react';
import { cn } from './utils';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export function Divider({ className, label, ...props }: DividerProps) {
  if (!label) {
    return <hr className={cn('shelf-line border-0 my-4', className)} {...props} />;
  }

  return (
    <div className={cn('relative flex items-center my-6', className)} {...props}>
      <div className="flex-grow border-t border-surface-border" />
      <span className="flex-shrink mx-4 text-xs uppercase tracking-widest text-deck-400 font-mono">
        {label}
      </span>
      <div className="flex-grow border-t border-surface-border" />
    </div>
  );
}
