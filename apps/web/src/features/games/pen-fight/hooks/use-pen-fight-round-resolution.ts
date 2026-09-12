'use client';

import { useFrame } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import { useCallback, useRef, type RefObject } from 'react';
import { evaluateRoundFrame } from '../engine/pen-fight-utils';
import type { PenFightOutcome } from '../types/pen-fight.types';
import type { PenFightSoundEngine } from '../utils/pen-fight-sound';

interface UsePenFightRoundResolutionParams {
  p1Ref: RefObject<RapierRigidBody | null>;
  p2Ref: RefObject<RapierRigidBody | null>;
  onResolveRound: (winner: PenFightOutcome) => void;
  sound: PenFightSoundEngine;
}

/**
 * Watches both pens each physics frame after a flick and reports the outcome once either
 * one tumbles off the table, or both come to rest with no one having fallen.
 */
export function usePenFightRoundResolution({
  p1Ref,
  p2Ref,
  onResolveRound,
  sound,
}: UsePenFightRoundResolutionParams) {
  const awaitingRef = useRef(false);
  const settleFramesRef = useRef(0);
  const fallenRef = useRef({ p1: false, p2: false });
  const fallGraceRef = useRef(0);
  const fallSoundPlayedRef = useRef(false);

  const resetRound = useCallback(() => {
    awaitingRef.current = false;
    settleFramesRef.current = 0;
    fallenRef.current = { p1: false, p2: false };
    fallGraceRef.current = 0;
    fallSoundPlayedRef.current = false;
  }, []);

  const beginRound = useCallback(() => {
    resetRound();
    awaitingRef.current = true;
  }, [resetRound]);

  useFrame(() => {
    if (!awaitingRef.current) return;
    const p1 = p1Ref.current;
    const p2 = p2Ref.current;
    if (!p1 || !p2) return;

    const result = evaluateRoundFrame({
      p1Y: p1.translation().y,
      p2Y: p2.translation().y,
      p1Fallen: fallenRef.current.p1,
      p2Fallen: fallenRef.current.p2,
      p1LinVel: p1.linvel(),
      p1AngVel: p1.angvel(),
      p2LinVel: p2.linvel(),
      p2AngVel: p2.angvel(),
      settleFrames: settleFramesRef.current,
      fallGraceFrames: fallGraceRef.current,
    });

    fallenRef.current = { p1: result.p1Fallen, p2: result.p2Fallen };
    settleFramesRef.current = result.settleFrames;
    fallGraceRef.current = result.fallGraceFrames;

    if ((result.p1Fallen || result.p2Fallen) && !fallSoundPlayedRef.current) {
      fallSoundPlayedRef.current = true;
      sound.playFall();
    }

    if (result.resolved) {
      awaitingRef.current = false;
      onResolveRound(result.outcome);
    }
  });

  return { beginRound, resetRound };
}
