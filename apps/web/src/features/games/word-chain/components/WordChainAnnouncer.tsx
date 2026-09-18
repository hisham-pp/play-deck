'use client';

import React from 'react';
import { turnConstraints } from '../engine/word-chain-state';
import type { WordChainState } from '../types/word-chain.types';

export interface WordChainAnnouncerProps {
  state: WordChainState;
}

/**
 * Screen readers get the turn, the required letters and the reason a word
 * bounced — none of which can be inferred from the visual layout alone.
 */
export function WordChainAnnouncer({ state }: WordChainAnnouncerProps) {
  const player = state.players[state.turnIndex];
  const { minLength } = turnConstraints(state, state.turnCount);
  const latest = state.chain[state.chain.length - 1];

  const parts: string[] = [];
  if (latest) parts.push(`Last word: ${latest.word.split('').join(' ')}, by ${latest.playerName}.`);
  if (state.status === 'playing' && player) {
    const prefix = state.requiredPrefix.split('').join(' ');
    parts.push(
      `${player.name}'s turn. Play a word of at least ${minLength} letters starting with ${prefix}.`,
    );
  }
  if (state.status === 'finished') parts.push(state.message);

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
