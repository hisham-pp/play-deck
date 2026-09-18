import type {
  PHASE_ASCENDING,
  PHASE_COLLAPSE,
  PHASE_COUNTDOWN,
  PHASE_IDLE,
  PHASE_PLACING,
  PHASE_SCORES,
  PHASE_SETTLING,
  SeatColor,
} from '../engine/elevator-constants';

export type ElevatorPhase =
  | typeof PHASE_IDLE
  | typeof PHASE_COUNTDOWN
  | typeof PHASE_PLACING
  | typeof PHASE_SETTLING
  | typeof PHASE_ASCENDING
  | typeof PHASE_COLLAPSE
  | typeof PHASE_SCORES;

export type ElevatorSeatType = 'human' | 'bot';

export interface ElevatorSeat {
  id: string;
  displayName: string;
  avatar: string;
  type: ElevatorSeatType;
  color: SeatColor;
  seatIndex: number;
  status: 'connected' | 'disconnected';
}

export interface ElevatorScore {
  seatId: string;
  points: number;
  placed: number;
  lost: number;
  /** Highest floor this seat still had cargo aboard for. */
  bestFloor: number;
}

/** One object drawn from the catalogue, as it exists in a live run. */
export interface ElevatorCargo {
  bodyId: string;
  shapeId: string;
  ownerId: string;
  placedOnFloor: number;
}

/** Render-ready transform for one body, and what the multiplayer host sends. */
export interface ElevatorBodyView {
  id: string;
  shapeId: string;
  ownerId: string | null;
  x: number;
  y: number;
  angle: number;
}

export type ElevatorBehavior = 'sway' | 'tilt' | 'sudden-stop' | 'speed-up' | 'wind' | 'bounce';

export interface ElevatorFloorPlan {
  floor: number;
  behaviors: ElevatorBehavior[];
  ascentMs: number;
  swayAmplitude: number;
  swayFrequency: number;
  tiltAmplitude: number;
  windStrength: number;
  windPeriod: number;
  bounceAmplitude: number;
  /** Fractions of the ascent at which the lift slams to a halt. */
  stopPoints: number[];
  shapeId: string;
}

export type ElevatorEventKind =
  'floor-start' | 'placed' | 'dropped' | 'jolt' | 'floor-cleared' | 'collapse';

export interface ElevatorEvent {
  id: number;
  kind: ElevatorEventKind;
  seatId: string | null;
  floor: number;
  /** Human-readable line for the live region and the ticker. */
  message: string;
}

export interface ElevatorGameState {
  phase: ElevatorPhase;
  floor: number;
  seats: ElevatorSeat[];
  scores: ElevatorScore[];
  /** Seat whose turn it is to place, or `null` outside the placing phase. */
  activeSeatId: string | null;
  /** Milliseconds left in whatever the current phase is counting down. */
  phaseRemainingMs: number;
  slipsRemaining: number;
  /** Catalogue id of the object waiting on the claw. */
  pendingShapeId: string | null;
  clawX: number;
  clawAngle: number;
  cargo: ElevatorCargo[];
  bodies: ElevatorBodyView[];
  platform: { x: number; y: number; angle: number };
  /** 0–1 measure of how violently the shaft is moving, for shake and audio. */
  turbulence: number;
  /** 0–1 through the current floor's ascent; 0 while the lift is docked. */
  ascentProgress: number;
  /** Metres from the platform surface to the top of the tallest object. */
  stackHeight: number;
  behaviors: ElevatorBehavior[];
  events: ElevatorEvent[];
  finished: boolean;
}

export interface ElevatorStats {
  runs: number;
  bestFloor: number;
  bestScore: number;
  objectsPlaced: number;
  objectsLost: number;
  lastPlayedAt: string;
}
