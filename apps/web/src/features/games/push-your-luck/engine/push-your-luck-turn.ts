import type {
  DrawCard,
  PushYourLuckSeat,
  PushYourLuckState,
  TurnEvent,
} from '../types/push-your-luck.types';
import {
  INSURANCE_MAX,
  KIND_INSURANCE,
  KIND_MULTIPLIER,
  KIND_STEAL,
  OUTCOME_BANKED,
  OUTCOME_BUST,
  OUTCOME_SAFE,
  OUTCOME_SAVED,
  PHASE_GAME_OVER,
  PHASE_PLAYING,
} from './push-your-luck-constants';
import { BUST_CARD, bustChanceForDraw, drawSafeCard } from './push-your-luck-deck';
import { nextRandom } from './push-your-luck-rng';
import { createEmptyTurn } from './push-your-luck-state';
import {
  activeSeatOf,
  canStealFrom,
  formatBustChance,
  richestOpponent,
} from './push-your-luck-utils';

function patchSeat(
  seats: PushYourLuckSeat[],
  index: number,
  patch: Partial<PushYourLuckSeat>,
): PushYourLuckSeat[] {
  return seats.map((seat, i) => (i === index ? { ...seat, ...patch } : seat));
}

interface SafeApplication {
  seats: PushYourLuckSeat[];
  pot: number;
  stolenFrom: string | null;
  message: string;
}

function applyStealCard(state: PushYourLuckState, card: DrawCard): SafeApplication {
  const victim = richestOpponent(state.seats, state.activeSeat);
  const seat = activeSeatOf(state);

  if (!victim) {
    return {
      seats: state.seats,
      pot: state.turn.pot + card.value,
      stolenFrom: null,
      message: `${seat.name} drew a steal with no target — ${card.value} points into the pot instead.`,
    };
  }

  const taken = Math.min(card.value, victim.banked);
  const victimIndex = state.seats.findIndex((entry) => entry.id === victim.id);

  return {
    seats: patchSeat(state.seats, victimIndex, { banked: victim.banked - taken }),
    pot: state.turn.pot + taken,
    stolenFrom: victim.id,
    message: `${seat.name} stole ${taken} banked points from ${victim.name}.`,
  };
}

function applySafeCard(state: PushYourLuckState, card: DrawCard): SafeApplication {
  const seat = activeSeatOf(state);

  if (card.kind === KIND_STEAL) return applyStealCard(state, card);

  if (card.kind === KIND_MULTIPLIER) {
    const pot = state.turn.pot * card.value;
    return {
      seats: state.seats,
      pot,
      stolenFrom: null,
      message: `${seat.name} hit a ×${card.value} — the pot is now ${pot}.`,
    };
  }

  if (card.kind === KIND_INSURANCE) {
    const insurance = Math.min(INSURANCE_MAX, seat.insurance + card.value);
    return {
      seats: patchSeat(state.seats, state.activeSeat, { insurance }),
      pot: state.turn.pot,
      stolenFrom: null,
      message: `${seat.name} picked up insurance — one bust will be absorbed.`,
    };
  }

  const pot = state.turn.pot + card.value;
  return {
    seats: state.seats,
    pot,
    stolenFrom: null,
    message: `${seat.name} drew +${card.value}. Pot at ${pot}.`,
  };
}

function appendEvent(state: PushYourLuckState, event: TurnEvent): TurnEvent[] {
  return [...state.turn.events, event];
}

function resolveBust(state: PushYourLuckState, seed: number): PushYourLuckState {
  const seat = activeSeatOf(state);
  const draws = state.turn.draws + 1;

  // Insurance absorbs the bust: the pot survives and the turn stays live.
  if (seat.insurance > 0) {
    const event: TurnEvent = { card: BUST_CARD, potAfter: state.turn.pot, outcome: OUTCOME_SAVED };
    return {
      ...state,
      seed,
      seats: patchSeat(state.seats, state.activeSeat, { insurance: seat.insurance - 1 }),
      turn: {
        ...state.turn,
        draws,
        events: appendEvent(state, event),
        savedByInsurance: true,
      },
      bustChance: bustChanceForDraw(draws + 1),
      lastOutcome: OUTCOME_SAVED,
      lastCard: BUST_CARD,
      stolenFrom: null,
      announcement: `Bust — but ${seat.name}'s insurance absorbed it. Pot of ${state.turn.pot} survives.`,
    };
  }

  const event: TurnEvent = { card: BUST_CARD, potAfter: 0, outcome: OUTCOME_BUST };
  return {
    ...state,
    seed,
    seats: patchSeat(state.seats, state.activeSeat, { busts: seat.busts + 1 }),
    turn: {
      ...state.turn,
      pot: 0,
      draws,
      events: appendEvent(state, event),
      resolved: OUTCOME_BUST,
    },
    bustChance: 0,
    lastOutcome: OUTCOME_BUST,
    lastCard: BUST_CARD,
    stolenFrom: null,
    announcement: `Bust. ${seat.name} loses ${state.turn.pot} points and the turn passes.`,
  };
}

/** Draws one card: rolls for a bust first, then pays out a safe card. */
export function pushDraw(state: PushYourLuckState): PushYourLuckState {
  if (state.phase !== PHASE_PLAYING || state.turn.resolved) return state;

  const draws = state.turn.draws + 1;
  const chance = bustChanceForDraw(draws);
  const roll = nextRandom(state.seed);

  if (roll.value < chance) return resolveBust(state, roll.seed);

  const draw = drawSafeCard({
    seed: roll.seed,
    drawIndex: draws,
    pot: state.turn.pot,
    canSteal: canStealFrom(state.seats, state.activeSeat),
  });

  const applied = applySafeCard({ ...state, seed: draw.seed }, draw.card);
  const nextChance = bustChanceForDraw(draws + 1);
  const event: TurnEvent = { card: draw.card, potAfter: applied.pot, outcome: OUTCOME_SAFE };

  return {
    ...state,
    seed: draw.seed,
    seats: applied.seats,
    turn: { ...state.turn, pot: applied.pot, draws, events: appendEvent(state, event) },
    bustChance: nextChance,
    lastOutcome: OUTCOME_SAFE,
    lastCard: draw.card,
    stolenFrom: applied.stolenFrom,
    announcement: `${applied.message} Next push busts ${formatBustChance(nextChance)} of the time.`,
  };
}

/** Banks the pot. Reaching the target score ends the match immediately. */
export function bankPot(state: PushYourLuckState): PushYourLuckState {
  if (state.phase !== PHASE_PLAYING || state.turn.resolved) return state;

  const seat = activeSeatOf(state);
  const banked = seat.banked + state.turn.pot;
  const seats = patchSeat(state.seats, state.activeSeat, {
    banked,
    bestRound: Math.max(seat.bestRound, state.turn.pot),
  });
  const hasWon = banked >= state.targetScore;

  return {
    ...state,
    seats,
    phase: hasWon ? PHASE_GAME_OVER : PHASE_PLAYING,
    winnerId: hasWon ? seat.id : null,
    turn: { ...state.turn, resolved: OUTCOME_BANKED },
    bustChance: 0,
    lastOutcome: OUTCOME_BANKED,
    announcement: hasWon
      ? `${seat.name} banks ${state.turn.pot} to reach ${banked} and wins the match.`
      : `${seat.name} banked ${state.turn.pot}. Safe total: ${banked}.`,
  };
}

/** Hands the table to the next seat once the result has been shown. */
export function endTurn(state: PushYourLuckState): PushYourLuckState {
  if (state.phase !== PHASE_PLAYING) return state;

  const activeSeat = (state.activeSeat + 1) % state.seats.length;
  const wrapped = activeSeat === 0;
  const nextSeat = state.seats[activeSeat];

  return {
    ...state,
    activeSeat,
    round: wrapped ? state.round + 1 : state.round,
    turn: createEmptyTurn(),
    bustChance: bustChanceForDraw(1),
    lastOutcome: null,
    lastCard: null,
    stolenFrom: null,
    announcement: `${nextSeat.name} is up with ${nextSeat.banked} banked. First draw is free.`,
  };
}
