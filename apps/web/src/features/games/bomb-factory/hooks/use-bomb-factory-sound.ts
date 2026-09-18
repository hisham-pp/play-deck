'use client';

import { useEffect, useRef } from 'react';
import {
  PHASE_MACHINE_CLEARED,
  PHASE_MACHINE_FAILED,
  PHASE_SHIFT_COMPLETE,
} from '../engine/bomb-factory-constants';
import { bombFactorySound } from '../services/bomb-factory-sound.service';
import type { BombFactoryState } from '../types/bomb-factory.types';

export function useBombFactorySound(state: BombFactoryState): void {
  const seatedRef = useRef(0);
  const faultRef = useRef<string | null>(null);
  const phaseRef = useRef(state.phase);

  useEffect(() => {
    if (state.completedSteps.length > seatedRef.current) bombFactorySound.playSeated();
    seatedRef.current = state.completedSteps.length;
  }, [state.completedSteps.length]);

  useEffect(() => {
    const attemptId = state.lastFault?.attemptId ?? null;
    if (attemptId && attemptId !== faultRef.current) bombFactorySound.playFault();
    faultRef.current = attemptId;
  }, [state.lastFault]);

  useEffect(() => {
    if (state.phase === phaseRef.current) return;
    phaseRef.current = state.phase;

    if (state.phase === PHASE_MACHINE_CLEARED || state.phase === PHASE_SHIFT_COMPLETE) {
      bombFactorySound.playCleared();
    } else if (state.phase === PHASE_MACHINE_FAILED) {
      bombFactorySound.playFailed();
    }
  }, [state.phase]);
}
