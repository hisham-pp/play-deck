import { useCallback, useEffect, useRef, useState } from 'react';
import { playSound } from '@/lib/audio/sound-synth';
import {
  DEFAULT_TARGET_SCORE,
  PHASE_GAME_OVER,
  PHASE_PLAYING,
  TURN_HANDOFF_MS,
} from '../engine/push-your-luck-constants';
import { PushYourLuckEngine } from '../engine/push-your-luck-engine';
import type { PushYourLuckSeat, PushYourLuckState } from '../types/push-your-luck.types';
import { usePushYourLuckBots } from './use-push-your-luck-bots';

const OUTCOME_SOUNDS = {
  safe: 'rune-flip',
  saved: 'rune-match',
  bust: 'rune-mismatch',
  banked: 'piece-home',
} as const;

type MatchOverCallback = (state: PushYourLuckState) => void;

function playOutcomeSound(next: PushYourLuckState, prev: PushYourLuckState): void {
  if (next.phase === PHASE_GAME_OVER && prev.phase !== PHASE_GAME_OVER) {
    playSound('victory');
    return;
  }
  if (next.activeSeat !== prev.activeSeat) {
    playSound('turn-pass');
    return;
  }
  if (next.lastOutcome && next.lastOutcome !== prev.lastOutcome) {
    playSound(OUTCOME_SOUNDS[next.lastOutcome]);
  }
}

export function usePushYourLuckEngine(onMatchOver?: MatchOverCallback) {
  const engineRef = useRef<PushYourLuckEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new PushYourLuckEngine();
  }
  const engine = engineRef.current;

  const [state, setState] = useState<PushYourLuckState>(() => engine.getState());
  const prevStateRef = useRef<PushYourLuckState>(state);

  useEffect(() => {
    const unsubscribe = engine.subscribe((next) => {
      const prev = prevStateRef.current;
      prevStateRef.current = next;
      setState(next);
      playOutcomeSound(next, prev);

      if (next.phase === PHASE_GAME_OVER && prev.phase !== PHASE_GAME_OVER) {
        onMatchOver?.(next);
      }
    });

    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, [engine, onMatchOver]);

  // Hold on the bust or bank result for a beat, then hand the table over.
  useEffect(() => {
    if (state.phase !== PHASE_PLAYING || !state.turn.resolved) return;

    const timer = setTimeout(() => engine.endTurn(), TURN_HANDOFF_MS);
    return () => clearTimeout(timer);
  }, [engine, state.phase, state.turn.resolved, state.activeSeat]);

  usePushYourLuckBots(engine, state);

  const push = useCallback(() => {
    playSound('dice-roll');
    return engine.push();
  }, [engine]);

  const bank = useCallback(() => engine.bank(), [engine]);

  const configure = useCallback(
    (seats: PushYourLuckSeat[], targetScore: number = DEFAULT_TARGET_SCORE) => {
      engine.configure(seats, targetScore);
    },
    [engine],
  );

  const resetMatch = useCallback(() => {
    playSound('ui-click');
    engine.resetMatch();
  }, [engine]);

  return { state, push, bank, configure, resetMatch };
}
