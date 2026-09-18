import type { DrawCard, DrawKind } from '../types/push-your-luck.types';
import {
  BUST_CHANCE_BASE,
  BUST_CHANCE_MAX,
  BUST_CHANCE_STEP,
  FREE_DRAWS,
  KIND_INSURANCE,
  KIND_MULTIPLIER,
  KIND_POINTS,
  KIND_STEAL,
  MULTIPLIER_DOUBLE,
  MULTIPLIER_TRIPLE,
  MULTIPLIER_TRIPLE_CHANCE,
  POINTS_DRAW_BONUS_CAP,
  POINTS_MIN,
  POINTS_SPREAD,
  STEAL_MIN,
  STEAL_SPREAD,
  WEIGHT_INSURANCE,
  WEIGHT_MULTIPLIER,
  WEIGHT_POINTS,
  WEIGHT_STEAL,
} from './push-your-luck-constants';
import { nextRandom, nextRandomInt, pickWeighted } from './push-your-luck-rng';

/**
 * Bust probability for the Nth draw of a turn (1-based). The opening draws are
 * free or near-free, then risk climbs in fixed steps up to a hard ceiling so
 * that pushing forever is always a losing plan but never a certainty.
 */
export function bustChanceForDraw(drawIndex: number): number {
  if (drawIndex <= FREE_DRAWS) return 0;
  const steps = drawIndex - FREE_DRAWS - 1;
  return Math.min(BUST_CHANCE_MAX, BUST_CHANCE_BASE + steps * BUST_CHANCE_STEP);
}

export interface DrawContext {
  seed: number;
  drawIndex: number;
  pot: number;
  /** False when no opponent holds banked points worth taking. */
  canSteal: boolean;
}

export interface DrawResult {
  seed: number;
  card: DrawCard;
}

function pointsCard(seed: number, drawIndex: number): DrawResult {
  const roll = nextRandomInt(seed, POINTS_SPREAD);
  const bonus = Math.min(drawIndex, POINTS_DRAW_BONUS_CAP);
  const value = POINTS_MIN + roll.value + bonus;
  return {
    seed: roll.seed,
    card: {
      kind: KIND_POINTS,
      value,
      label: `+${value}`,
      detail: `${value} points into the pot`,
    },
  };
}

function multiplierCard(seed: number): DrawResult {
  const roll = nextRandom(seed);
  const factor = roll.value < MULTIPLIER_TRIPLE_CHANCE ? MULTIPLIER_TRIPLE : MULTIPLIER_DOUBLE;
  return {
    seed: roll.seed,
    card: {
      kind: KIND_MULTIPLIER,
      value: factor,
      label: `×${factor}`,
      detail: `The whole pot is multiplied by ${factor}`,
    },
  };
}

function stealCard(seed: number): DrawResult {
  const roll = nextRandomInt(seed, STEAL_SPREAD);
  const value = STEAL_MIN + roll.value;
  return {
    seed: roll.seed,
    card: {
      kind: KIND_STEAL,
      value,
      label: `Steal ${value}`,
      detail: `Take up to ${value} banked points from the leader`,
    },
  };
}

function insuranceCard(seed: number): DrawResult {
  return {
    seed,
    card: {
      kind: KIND_INSURANCE,
      value: 1,
      label: 'Insurance',
      detail: 'Absorbs one bust — the pot survives',
    },
  };
}

const BUILDERS: Record<
  Exclude<DrawKind, 'bust'>,
  (seed: number, drawIndex: number) => DrawResult
> = {
  [KIND_POINTS]: pointsCard,
  [KIND_MULTIPLIER]: (seed) => multiplierCard(seed),
  [KIND_STEAL]: (seed) => stealCard(seed),
  [KIND_INSURANCE]: (seed) => insuranceCard(seed),
};

/**
 * Draws one non-bust card. The bust roll happens before this in the turn
 * resolver, so the deck only ever has to decide what a *safe* draw pays out.
 */
export function drawSafeCard({ seed, drawIndex, pot, canSteal }: DrawContext): DrawResult {
  const pick = pickWeighted<Exclude<DrawKind, 'bust'>>(seed, [
    { value: KIND_POINTS, weight: WEIGHT_POINTS },
    { value: KIND_MULTIPLIER, weight: pot > 0 ? WEIGHT_MULTIPLIER : 0 },
    { value: KIND_STEAL, weight: canSteal ? WEIGHT_STEAL : 0 },
    { value: KIND_INSURANCE, weight: WEIGHT_INSURANCE },
  ]);

  return BUILDERS[pick.value](pick.seed, drawIndex);
}

export const BUST_CARD: DrawCard = {
  kind: 'bust',
  value: 0,
  label: 'BUST',
  detail: 'The pot is gone',
};
