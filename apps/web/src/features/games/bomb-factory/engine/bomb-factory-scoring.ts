import type { BombFactoryState, FaultRecord } from '../types/bomb-factory.types';
import {
  SCORE_PER_FAULT,
  SCORE_PER_MACHINE,
  SCORE_PER_SECOND_LEFT,
} from './bomb-factory-constants';

/**
 * Seconds left on the machine clock. Faults are charged straight to the clock,
 * so a penalty and a slow build cost exactly the same thing.
 */
export function remainingSeconds(state: BombFactoryState, at: number): number {
  if (!state.spec || state.startedAt === null) return 0;
  const elapsed = Math.floor((at - state.startedAt) / 1000);
  return Math.max(0, state.spec.timeLimitSeconds - state.penaltySeconds - elapsed);
}

/** Award for clearing one machine: the build, the clock left, less every fault. */
export function machineScore(secondsLeft: number, faults: FaultRecord[]): number {
  const award =
    SCORE_PER_MACHINE + secondsLeft * SCORE_PER_SECOND_LEFT + faults.length * SCORE_PER_FAULT;
  return Math.max(0, award);
}
