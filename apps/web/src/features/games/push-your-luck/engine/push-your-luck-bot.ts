import type { BotNerve, PushYourLuckSeat, PushYourLuckState } from '../types/push-your-luck.types';
import { NERVE_BALANCED, NERVE_CAUTIOUS, NERVE_RECKLESS } from './push-your-luck-constants';
import { activeSeatOf, leaderSeat } from './push-your-luck-utils';

export type BotDecision = 'push' | 'bank';

interface NerveProfile {
  /** Bank once the pot reaches this many points. */
  potCeiling: number;
  /** Bank once the next push is at least this likely to bust. */
  riskCeiling: number;
}

const PROFILES: Record<BotNerve, NerveProfile> = {
  [NERVE_CAUTIOUS]: { potCeiling: 12, riskCeiling: 0.16 },
  [NERVE_BALANCED]: { potCeiling: 20, riskCeiling: 0.26 },
  [NERVE_RECKLESS]: { potCeiling: 32, riskCeiling: 0.46 },
};

/** How close the nearest rival is to winning, as a 0-1 fraction of the target. */
function rivalPressure(state: PushYourLuckState, seat: PushYourLuckSeat): number {
  const rivals = state.seats.filter((entry) => entry.id !== seat.id);
  if (rivals.length === 0) return 0;
  const closest = leaderSeat(rivals);
  return Math.min(1, closest.banked / Math.max(1, state.targetScore));
}

/**
 * Decides push or bank for the active bot seat. Bots bank a winning pot on
 * sight, loosen up when a rival is closing on the target, and otherwise stop
 * at the pot and risk ceilings their nerve allows.
 */
export function decideBotAction(state: PushYourLuckState): BotDecision {
  const seat = activeSeatOf(state);
  const { pot, draws } = state.turn;

  // The free opening draw is never worth skipping.
  if (draws === 0) return 'push';

  // Banking here wins outright.
  if (seat.banked + pot >= state.targetScore) return 'bank';

  const profile = PROFILES[seat.nerve] ?? PROFILES[NERVE_BALANCED];
  const pressure = rivalPressure(state, seat);
  const potCeiling = profile.potCeiling * (1 + pressure);
  const riskCeiling = profile.riskCeiling + pressure * 0.2;

  // Insurance in hand means the next bust costs nothing, so keep pushing.
  if (seat.insurance > 0 && pot < potCeiling * 1.6) return 'push';

  if (pot >= potCeiling) return 'bank';
  if (state.bustChance >= riskCeiling) return 'bank';

  return 'push';
}
