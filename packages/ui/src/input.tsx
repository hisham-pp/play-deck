import React from 'react';
import { cn } from './utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, action, id, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-semibold uppercase tracking-wider text-deck-500"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3 text-deck-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full py-2 text-xs rounded-md border border-surface-border bg-surface-raised text-deck-900 dark:text-white placeholder-deck-400 transition-colors focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500',
              icon ? 'pl-9 pr-3' : 'px-3',
              action && 'pr-9',
              error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
              className,
            )}
            {...props}
          />
          {action && <div className="absolute right-3 flex items-center">{action}</div>}
        </div>
        {error ? (
          <span className="text-[11px] text-rose-500 font-medium">{error}</span>
        ) : helperText ? (
          <span className="text-[11px] text-deck-400">{helperText}</span>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
