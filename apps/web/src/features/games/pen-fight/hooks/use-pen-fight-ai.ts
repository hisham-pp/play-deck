'use client';

import type { RapierRigidBody } from '@react-three/rapier';
import { useEffect, useRef, type RefObject } from 'react';
import { AI_THINK_DELAY_MS } from '../engine/pen-fight-constants';
import { computeAIFlick } from '../engine/pen-fight-utils';
import type { FlickImpulse, PenFightPlayerId, PenFightState } from '../types/pen-fight.types';

interface UsePenFightAIParams {
  state: PenFightState;
  p1Ref: RefObject<RapierRigidBody | null>;
  p2Ref: RefObject<RapierRigidBody | null>;
  onFlick: (playerId: PenFightPlayerId, direction: FlickImpulse, power: number) => void;
}

/** Waits a beat, then flicks the CPU's pen toward the opponent's current position. */
export function usePenFightAI({ state, p1Ref, p2Ref, onFlick }: UsePenFightAIParams) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const activeInfo = state.players[state.activePlayer];
    if (state.phase !== 'aiming' || !activeInfo.isAI) return undefined;

    timerRef.current = setTimeout(() => {
      const ownBody = state.activePlayer === 'p1' ? p1Ref.current : p2Ref.current;
      const opponentBody = state.activePlayer === 'p1' ? p2Ref.current : p1Ref.current;
      if (!ownBody || !opponentBody) return;

      const flick = computeAIFlick(
        ownBody.translation(),
        opponentBody.translation(),
        state.difficulty,
      );
      onFlick(state.activePlayer, flick.direction, flick.power);
    }, AI_THINK_DELAY_MS[state.difficulty]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.phase, state.activePlayer, state.difficulty, state.players, p1Ref, p2Ref, onFlick]);
}
