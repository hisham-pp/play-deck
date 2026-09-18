import type {
  ElevatorFloorPlan,
  ElevatorGameState,
  ElevatorSeat,
} from '../types/unstable-elevator.types';
import { makeEvent, pushEvent } from './elevator-events';
import { getShape, type ElevatorShape } from './elevator-objects';
import { awardFloorSurvival, awardPlacement, chargeDrop } from './elevator-scoring';

/** One piece of cargo that has just left the shaft. */
export interface LostCargo {
  bodyId: string;
  shapeId: string;
  ownerId: string;
}

function seatName(state: ElevatorGameState, seatId: string): string {
  return state.seats.find((seat) => seat.id === seatId)?.displayName ?? 'Someone';
}

/** Opens a floor: new plan, new object on the claw, next seat at the controls. */
export function applyFloorStart(
  state: ElevatorGameState,
  plan: ElevatorFloorPlan,
  seat: ElevatorSeat | null,
): ElevatorGameState {
  const shape = getShape(plan.shapeId);
  return {
    ...state,
    floor: plan.floor,
    activeSeatId: seat?.id ?? null,
    pendingShapeId: plan.shapeId,
    behaviors: plan.behaviors,
    clawX: 0,
    clawAngle: 0,
    events: pushEvent(
      state.events,
      makeEvent('floor-start', `Floor ${plan.floor} — ${shape.label} on the claw`, plan.floor),
    ),
  };
}

/** Books a released object against its owner's score sheet. */
export function applyPlacement(
  state: ElevatorGameState,
  bodyId: string,
  shape: ElevatorShape,
  seatId: string,
): ElevatorGameState {
  return {
    ...state,
    pendingShapeId: null,
    cargo: [
      ...state.cargo,
      { bodyId, shapeId: shape.id, ownerId: seatId, placedOnFloor: state.floor },
    ],
    scores: awardPlacement(state.scores, seatId, shape, state.floor),
    events: pushEvent(
      state.events,
      makeEvent(
        'placed',
        `${seatName(state, seatId)} let go of the ${shape.label.toLowerCase()}`,
        state.floor,
        seatId,
      ),
    ),
  };
}

/**
 * Charges every owner whose cargo went over the edge and spends one of the
 * crew's shared slips per loss.
 */
export function applyLosses(state: ElevatorGameState, lost: LostCargo[]): ElevatorGameState {
  let scores = state.scores;
  let events = state.events;
  let slips = state.slipsRemaining;
  const lostIds = new Set(lost.map((entry) => entry.bodyId));

  for (const entry of lost) {
    const shape = getShape(entry.shapeId);
    scores = chargeDrop(scores, entry.ownerId, shape, state.floor);
    slips -= 1;
    events = pushEvent(
      events,
      makeEvent(
        'dropped',
        `${shape.label} overboard — ${seatName(state, entry.ownerId)} takes the hit`,
        state.floor,
        entry.ownerId,
      ),
    );
  }

  return {
    ...state,
    scores,
    events,
    slipsRemaining: slips,
    cargo: state.cargo.filter((entry) => !lostIds.has(entry.bodyId)),
  };
}

/** Pays out upkeep and the height bonus for a floor the tower survived. */
export function applyFloorClear(state: ElevatorGameState, height: number): ElevatorGameState {
  const owners = state.cargo.map((entry) => entry.ownerId);
  return {
    ...state,
    scores: awardFloorSurvival(state.scores, owners, state.floor, height),
    events: pushEvent(
      state.events,
      makeEvent(
        'floor-cleared',
        `Floor ${state.floor} cleared, ${owners.length} still aboard`,
        state.floor,
      ),
    ),
  };
}

export function applyCollapse(state: ElevatorGameState): ElevatorGameState {
  return {
    ...state,
    activeSeatId: null,
    pendingShapeId: null,
    events: pushEvent(
      state.events,
      makeEvent('collapse', `The lift gives out on floor ${state.floor}`, state.floor),
    ),
  };
}
