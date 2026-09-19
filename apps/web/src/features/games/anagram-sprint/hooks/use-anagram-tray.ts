'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createRandom, reshuffle } from '../engine/anagram-scramble';
import { currentRound } from '../engine/anagram-state';
import type { AnagramState } from '../types/anagram-sprint.types';

export interface AnagramTray {
  /** The letters as they are currently laid out on screen. */
  letters: string;
  /** Rearranges the tray. Purely local — it never changes anyone else's view. */
  shuffle: () => void;
}

/**
 * The letter tray. Every seat starts a round from the same deal, but the
 * shuffle button only moves the tiles on this device: rearranging them is a
 * thinking aid, not a move, so it stays off the wire.
 */
export function useAnagramTray(state: AnagramState): AnagramTray {
  const round = currentRound(state);
  const dealt = round?.scrambled ?? '';
  const answer = round?.entry.word ?? '';
  const [letters, setLetters] = useState(dealt);

  useEffect(() => {
    setLetters(dealt);
  }, [dealt]);

  // Seeded off the round so a re-render never reshuffles behind the player.
  const random = useMemo(
    () => createRandom(state.seed + state.roundIndex + 1),
    [state.seed, state.roundIndex],
  );

  const shuffle = useCallback(() => {
    if (!answer) return;
    setLetters((current) => reshuffle(answer, current, random));
  }, [answer, random]);

  return { letters, shuffle };
}
