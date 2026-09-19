'use client';

import React from 'react';
import { STATUS_FINISHED, STATUS_PLAYING, STATUS_ROUND_SUMMARY } from '../engine/anagram-constants';
import { currentRound } from '../engine/anagram-state';
import type { AnagramState } from '../types/anagram-sprint.types';

export interface AnagramAnnouncerProps {
  state: AnagramState;
}

/**
 * The letters are the whole game, so they are read out one at a time — a
 * screen reader saying "rutaese" is useless, "r, u, t, a, e, s, e" is playable.
 * The tray's own label covers the visual reading; this adds the round, the
 * result and the reason a guess bounced.
 */
export function AnagramAnnouncer({ state }: AnagramAnnouncerProps) {
  const round = currentRound(state);
  const parts: string[] = [];

  if (state.status === STATUS_PLAYING && round) {
    parts.push(
      `Word ${round.index + 1} of ${state.rules.totalRounds}. ` +
        `${round.entry.word.length} letters: ${[...round.scrambled].join(', ').toUpperCase()}.`,
    );
  }
  if (state.status === STATUS_ROUND_SUMMARY || state.status === STATUS_FINISHED) {
    parts.push(state.message);
  }

  return (
    <>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {parts.join(' ')}
      </p>
      <p aria-live="assertive" aria-atomic="true" className="sr-only">
        {state.lastRejection ? state.message : ''}
      </p>
    </>
  );
}
