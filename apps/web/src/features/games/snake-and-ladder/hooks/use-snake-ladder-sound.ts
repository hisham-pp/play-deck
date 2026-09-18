'use client';

import { useEffect, useRef } from 'react';
import { playSound } from '@/lib/audio/sound-synth';
import { STATUS_COMPLETED } from '../engine/snake-ladder-constants';
import type { SnakeLadderGameState } from '../types/snake-and-ladder.types';

/**
 * Translates engine transitions into sound effects. Purely cosmetic — never
 * influences game logic, and safe to remove without changing behaviour.
 */
export function useSnakeLadderSound(state: SnakeLadderGameState): void {
  const lastMoveIdRef = useRef(state.lastMove?.moveId ?? 0);
  const lastStatusRef = useRef(state.status);

  useEffect(() => {
    const previousStatus = lastStatusRef.current;
    lastStatusRef.current = state.status;

    if (state.status === STATUS_COMPLETED && previousStatus !== STATUS_COMPLETED) {
      playSound('victory');
      return;
    }

    const moveId = state.lastMove?.moveId ?? 0;
    if (moveId <= lastMoveIdRef.current) return;
    lastMoveIdRef.current = moveId;

    const move = state.lastMove;
    if (!move) return;

    playSound('dice-roll');

    if (move.won) return;
    if (move.jump?.kind === 'ladder') {
      playSound('piece-home');
    } else if (move.jump?.kind === 'snake') {
      playSound('capture');
    } else if (move.from === move.to) {
      playSound('turn-pass');
    } else {
      playSound('piece-move');
    }
  }, [state]);
}
