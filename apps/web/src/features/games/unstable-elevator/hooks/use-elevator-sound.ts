'use client';

import { useEffect, useRef } from 'react';
import { usePreferencesStore } from '@/stores/preferences.store';
import { PHASE_ASCENDING, PHASE_COUNTDOWN } from '../engine/elevator-constants';
import { elevatorSound } from '../services/elevator-sound.service';
import type { ElevatorGameState } from '../types/unstable-elevator.types';

/** Plays the shaft. Every cue is driven by state the engine already publishes. */
export function useElevatorSound(state: ElevatorGameState): void {
  const soundEnabled = usePreferencesStore((preferences) => preferences.soundEnabled);
  const lastEventId = useRef(0);
  const lastTick = useRef(-1);

  useEffect(() => {
    elevatorSound.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => () => elevatorSound.stopMotor(), []);

  // One cue per new event, whichever client the event arrived on.
  useEffect(() => {
    const event = state.events[state.events.length - 1];
    if (!event || event.id === lastEventId.current) return;
    lastEventId.current = event.id;

    switch (event.kind) {
      case 'placed':
        elevatorSound.playRelease();
        break;
      case 'dropped':
        elevatorSound.playDrop();
        break;
      case 'floor-cleared':
        elevatorSound.playFloorCleared();
        break;
      case 'collapse':
        elevatorSound.playCollapse();
        break;
      default:
        break;
    }
  }, [state.events]);

  useEffect(() => {
    if (state.phase !== PHASE_COUNTDOWN) {
      lastTick.current = -1;
      return;
    }
    const tick = Math.ceil(state.phaseRemainingMs / 1000);
    if (tick === lastTick.current) return;
    lastTick.current = tick;
    elevatorSound.playCountdown(tick <= 1);
  }, [state.phase, state.phaseRemainingMs]);

  useEffect(() => {
    const climbing = state.phase === PHASE_ASCENDING;
    elevatorSound.setMotor(climbing ? 0.35 + state.turbulence * 0.65 : 0);
  }, [state.phase, state.turbulence]);
}
