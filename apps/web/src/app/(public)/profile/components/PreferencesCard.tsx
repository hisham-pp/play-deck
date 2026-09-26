'use client';

import { Database, Eye, Moon, Settings, Volume2 } from 'lucide-react';
import React, { useEffect } from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';

export function PreferencesCard() {
  const {
    theme,
    soundEnabled,
    reducedMotion,
    autoSave,
    isInitialized,
    initPreferences,
    setTheme,
    toggleSound,
    toggleReducedMotion,
    toggleAutoSave,
  } = usePreferencesStore();

  useEffect(() => {
    initPreferences();
  }, [initPreferences]);

  if (!isInitialized) return null;

  return (
    <div className="p-6 rounded-2xl border border-surface-border bg-surface-raised shadow-xl flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-black text-deck-950 dark:text-white tracking-tight">
            Preferences & Accessibility
          </h3>
          <p className="text-xs text-deck-400">
            Customize your arcade sensory experience and browser persistence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Theme Picker */}
        <div className="p-4 rounded-xl border border-surface-border bg-surface-overlay flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-deck-200">Theme</span>
            </div>
            <span className="text-[10px] font-mono capitalize text-slate-400">{theme}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(['dark', 'light', 'system'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  theme === t
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-surface-raised text-deck-400 hover:text-deck-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Sound FX Toggle */}
        <div className="p-4 rounded-xl border border-surface-border bg-surface-overlay flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-deck-200 block">Sound FX</span>
              <span className="text-[11px] text-deck-400">Web Audio synthesis</span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
              soundEnabled
                ? 'bg-amber-500 border-amber-400'
                : 'bg-surface-raised border-surface-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="p-4 rounded-xl border border-surface-border bg-surface-overlay flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-deck-200 block">Reduced Motion</span>
              <span className="text-[11px] text-deck-400">Diminish animations</span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleReducedMotion}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
              reducedMotion
                ? 'bg-amber-500 border-amber-400'
                : 'bg-surface-raised border-surface-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                reducedMotion ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Auto-Save Toggle */}
        <div className="p-4 rounded-xl border border-surface-border bg-surface-overlay flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-deck-200 block">Auto-Save State</span>
              <span className="text-[11px] text-deck-400">IndexedDB local storage</span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleAutoSave}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
              autoSave ? 'bg-amber-500 border-amber-400' : 'bg-surface-raised border-surface-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                autoSave ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
