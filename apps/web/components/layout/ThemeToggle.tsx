'use client';

import React, { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferences.store';

export function ThemeToggle() {
  const { theme, setTheme, initPreferences, isInitialized } = usePreferencesStore();

  useEffect(() => {
    initPreferences();
  }, [initPreferences]);

  const toggle = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  if (!isInitialized) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-600 dark:text-deck-300 hover:text-deck-900 dark:hover:text-white transition-colors"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-amber-600" />}
    </button>
  );
}
