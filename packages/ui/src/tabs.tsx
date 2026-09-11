'use client';

import React, { createContext, useContext } from 'react';
import { cn } from './utils';

interface TabsContextValue {
  activeTab: string;
  onChange: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ value, onValueChange, className, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeTab: value, onChange: onValueChange }}>
      <div className={cn('flex flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-lg border border-surface-border bg-surface-raised overflow-x-auto',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabTrigger must be used within Tabs');
  const isActive = ctx.activeTab === value;

  return (
    <button
      onClick={() => ctx.onChange(value)}
      className={cn(
        'px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex-shrink-0 select-none',
        isActive
          ? 'bg-amber-500 text-slate-950 shadow-sm'
          : 'text-deck-600 dark:text-deck-400 hover:text-deck-950 dark:hover:text-white hover:bg-surface-overlay',
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('TabContent must be used within Tabs');
  if (ctx.activeTab !== value) return null;

  return <div className={cn('w-full', className)}>{children}</div>;
}
