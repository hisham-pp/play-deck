'use client';

import { useCallback, useEffect, useState } from 'react';
import { colorThiefPreferencesRepository } from '../services/color-thief-preferences-repository';

/**
 * High contrast is a per-game choice rather than a global one: it swaps the
 * arena's paints for flat, maximum-contrast blocks, which would be wrong for
 * the rest of PlayDeck. It lives in this game's own preferences record.
 */
export function useHighContrast(): [boolean, () => void] {
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    void colorThiefPreferencesRepository
      .getPreferences()
      .then((prefs) => setHighContrast(prefs.highContrast));
  }, []);

  const toggle = useCallback(() => {
    setHighContrast((previous) => {
      void colorThiefPreferencesRepository.savePreferences({ highContrast: !previous });
      return !previous;
    });
  }, []);

  return [highContrast, toggle];
}
