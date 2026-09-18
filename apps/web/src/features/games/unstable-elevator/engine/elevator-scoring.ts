import type { ElevatorScore, ElevatorSeat } from '../types/unstable-elevator.types';
import type { ElevatorShape } from './elevator-objects';

/** Points added per floor on top of a shape's own value. */
const FLOOR_BONUS = 2;
/** Flat part of the penalty for losing cargo overboard. */
const DROP_PENALTY_BASE = 18;
/** Upkeep paid per surviving object at the end of every floor. */
const UPKEEP_PER_OBJECT = 3;
/** Points per metre of tower still standing when a floor is cleared. */
const HEIGHT_BONUS_PER_METRE = 4;

export function emptyScores(seats: ElevatorSeat[]): ElevatorScore[] {
  return seats.map((seat) => ({
    seatId: seat.id,
    points: 0,
    placed: 0,
    lost: 0,
    bestFloor: 0,
  }));
}

function updateSeat(
  scores: ElevatorScore[],
  seatId: string,
  change: (score: ElevatorScore) => ElevatorScore,
): ElevatorScore[] {
  return scores.map((score) => (score.seatId === seatId ? change(score) : score));
}

export function placementPoints(shape: ElevatorShape, floor: number): number {
  return shape.points + floor * FLOOR_BONUS;
}

export function dropPenalty(shape: ElevatorShape, floor: number): number {
  return DROP_PENALTY_BASE + floor * FLOOR_BONUS + Math.round(shape.points / 2);
}

/** Landing an object pays immediately; keeping it aboard pays again later. */
export function awardPlacement(
  scores: ElevatorScore[],
  seatId: string,
  shape: ElevatorShape,
  floor: number,
): ElevatorScore[] {
  return updateSeat(scores, seatId, (score) => ({
    ...score,
    points: score.points + placementPoints(shape, floor),
    placed: score.placed + 1,
    bestFloor: Math.max(score.bestFloor, floor),
  }));
}

/** Losing an object overboard costs its owner, and only its owner. */
export function chargeDrop(
  scores: ElevatorScore[],
  seatId: string,
  shape: ElevatorShape,
  floor: number,
): ElevatorScore[] {
  return updateSeat(scores, seatId, (score) => ({
    ...score,
    points: score.points - dropPenalty(shape, floor),
    lost: score.lost + 1,
  }));
}

export function heightBonus(stackHeight: number): number {
  return Math.max(0, Math.round(stackHeight * HEIGHT_BONUS_PER_METRE));
}

/**
 * Paid to everyone still holding cargo when a floor is cleared. `ownersAboard`
 * lists an owner once per surviving object, so a bigger share of the tower
 * earns a bigger share of the upkeep.
 */
export function awardFloorSurvival(
  scores: ElevatorScore[],
  ownersAboard: string[],
  floor: number,
  stackHeight: number,
): ElevatorScore[] {
  if (ownersAboard.length === 0) return scores;

  const bonus = heightBonus(stackHeight);
  const share = Math.round(bonus / ownersAboard.length);

  const counts = new Map<string, number>();
  for (const owner of ownersAboard) counts.set(owner, (counts.get(owner) ?? 0) + 1);

  return scores.map((score) => {
    const aboard = counts.get(score.seatId) ?? 0;
    if (aboard === 0) return score;
    return {
      ...score,
      points: score.points + aboard * UPKEEP_PER_OBJECT + share,
      bestFloor: Math.max(score.bestFloor, floor),
    };
  });
}

export interface RankedScore extends ElevatorScore {
  rank: number;
}

/**
 * Highest points first; ties break towards the player who lost less cargo,
 * then towards the one who placed more of it.
 */
export function rankScores(scores: ElevatorScore[]): RankedScore[] {
  const sorted = [...scores].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (a.lost !== b.lost) return a.lost - b.lost;
    return b.placed - a.placed;
  });

  let rank = 0;
  let previous: ElevatorScore | null = null;
  return sorted.map((score, index) => {
    const tied =
      previous !== null &&
      previous.points === score.points &&
      previous.lost === score.lost &&
      previous.placed === score.placed;
    if (!tied) rank = index + 1;
    previous = score;
    return { ...score, rank };
  });
}
