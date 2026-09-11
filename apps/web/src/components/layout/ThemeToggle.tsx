'use client';

import { Sun, Moon } from 'lucide-react';
import React, { useEffect } from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';

const THEME_DARK = 'dark';

export function ThemeToggle() {
  const { theme, setTheme, initPreferences, isInitialized } = usePreferencesStore();

  useEffect(() => {
    initPreferences();
  }, [initPreferences]);

  const toggle = () => {
    if (theme === THEME_DARK) {
      setTheme('light');
    } else {
      setTheme(THEME_DARK);
    }
  };

  if (!isInitialized) {
    return <div className="w-9 h-9" />;
  }

  const isDark = theme === THEME_DARK;

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-md border border-surface-border bg-surface-raised hover:bg-surface-overlay text-deck-600 dark:text-deck-300 hover:text-deck-900 dark:hover:text-white transition-colors"
      title={`Switch to ${isDark ? 'light' : THEME_DARK} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-amber-600" />}
    </button>
  );
}
