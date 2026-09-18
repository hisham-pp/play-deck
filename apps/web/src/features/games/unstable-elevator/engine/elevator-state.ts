import type { ElevatorGameState, ElevatorSeat } from '../types/unstable-elevator.types';
import { PHASE_IDLE } from './elevator-constants';
import { emptyScores } from './elevator-scoring';

export interface InitialStateOptions {
  seats: ElevatorSeat[];
  slips: number;
  /** Resting height of the platform, so frame zero draws it in the right place. */
  platformY: number;
  bodies: ElevatorGameState['bodies'];
}

export function createInitialState({
  seats,
  slips,
  platformY,
  bodies,
}: InitialStateOptions): ElevatorGameState {
  return {
    phase: PHASE_IDLE,
    floor: 0,
    seats,
    scores: emptyScores(seats),
    activeSeatId: null,
    phaseRemainingMs: 0,
    slipsRemaining: slips,
    pendingShapeId: null,
    clawX: 0,
    clawAngle: 0,
    cargo: [],
    bodies,
    platform: { x: 0, y: platformY, angle: 0 },
    turbulence: 0,
    ascentProgress: 0,
    stackHeight: 0,
    behaviors: [],
    events: [],
    finished: false,
  };
}

/** Timer resolution the HUD is refreshed at, in milliseconds. */
const HUD_TIMER_GRANULARITY = 250;

/**
 * A fingerprint of everything React renders. The engine ticks 120 times a
 * second; re-rendering the HUD that often would be waste, so it only publishes
 * when this string changes.
 */
export function hudSignature(state: ElevatorGameState): string {
  return [
    state.phase,
    state.floor,
    state.activeSeatId,
    state.slipsRemaining,
    state.pendingShapeId,
    state.events[state.events.length - 1]?.id ?? 0,
    Math.ceil(state.phaseRemainingMs / HUD_TIMER_GRANULARITY),
    state.scores.map((score) => score.points).join(','),
    state.finished,
  ].join('|');
}
