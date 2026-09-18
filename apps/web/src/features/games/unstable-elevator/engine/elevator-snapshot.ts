import type {
  ElevatorBodyView,
  ElevatorCargo,
  ElevatorGameState,
} from '../types/unstable-elevator.types';

/**
 * Everything a guest needs to draw the run exactly as the host sees it. The
 * host owns the simulation; guests never step physics of their own, so this is
 * the whole contract between them.
 */
export interface ElevatorSnapshot {
  phase: ElevatorGameState['phase'];
  floor: number;
  activeSeatId: string | null;
  phaseRemainingMs: number;
  slipsRemaining: number;
  pendingShapeId: string | null;
  clawX: number;
  clawAngle: number;
  scores: ElevatorGameState['scores'];
  cargo: ElevatorCargo[];
  bodies: ElevatorBodyView[];
  platform: ElevatorGameState['platform'];
  turbulence: number;
  ascentProgress: number;
  events: ElevatorGameState['events'];
  finished: boolean;
}

export function toSnapshot(state: ElevatorGameState): ElevatorSnapshot {
  return {
    phase: state.phase,
    floor: state.floor,
    activeSeatId: state.activeSeatId,
    phaseRemainingMs: state.phaseRemainingMs,
    slipsRemaining: state.slipsRemaining,
    pendingShapeId: state.pendingShapeId,
    clawX: state.clawX,
    clawAngle: state.clawAngle,
    scores: state.scores,
    cargo: state.cargo,
    bodies: state.bodies,
    platform: state.platform,
    turbulence: state.turbulence,
    ascentProgress: state.ascentProgress,
    events: state.events,
    finished: state.finished,
  };
}

/** Folds a host snapshot into local state, keeping seats and the floor plan. */
export function mergeSnapshot(
  state: ElevatorGameState,
  snapshot: ElevatorSnapshot,
  behaviors: ElevatorGameState['behaviors'],
  height: number,
): ElevatorGameState {
  return { ...state, ...snapshot, behaviors, stackHeight: height };
}
