'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';
import { penFightSound } from '../utils/pen-fight-sound';

/** Keeps the synthesized sound engine in sync with the player's global sound preference. */
export function usePenFightSound() {
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);

  useEffect(() => {
    penFightSound.setEnabled(soundEnabled);
  }, [soundEnabled]);

  return penFightSound;
}
