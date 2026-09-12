import { useEffect, useRef } from 'react';
import { playSound } from '@/lib/audio/sound-synth';
import type { LudoGameState } from '../types/ludo.types';

/**
 * Translates engine state transitions into sound effects. Purely cosmetic -
 * never influences game logic, and safe to remove without changing behavior.
 */
export function useLudoSound(state: LudoGameState): void {
  const previousLogLengthRef = useRef(state.actionLog.length);
  const previousStatusRef = useRef(state.status);

  useEffect(() => {
    const previousLength = previousLogLengthRef.current;
    const previousStatus = previousStatusRef.current;
    previousLogLengthRef.current = state.actionLog.length;
    previousStatusRef.current = state.status;

    if (state.status === 'completed' && previousStatus !== 'completed') {
      playSound('victory');
      return;
    }

    if (state.actionLog.length <= previousLength) return;

    const lastAction = state.actionLog[state.actionLog.length - 1];
    if (!lastAction) return;

    if (lastAction.type === 'ROLL_DICE') {
      playSound('dice-roll');
      return;
    }

    if (lastAction.type === 'MOVE_PIECE') {
      const note = state.lastMoveNote ?? '';
      if (/captured/i.test(note)) {
        playSound('capture');
      } else if (/reached home/i.test(note)) {
        playSound('piece-home');
      } else {
        playSound('piece-move');
      }
      return;
    }
  }, [state]);
}
