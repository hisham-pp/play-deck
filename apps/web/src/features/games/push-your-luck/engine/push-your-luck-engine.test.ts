import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PushYourLuckSeat, PushYourLuckState } from '../types/push-your-luck.types';
import { decideBotAction } from './push-your-luck-bot';
import {
  BUST_CHANCE_MAX,
  DEFAULT_TARGET_SCORE,
  INSURANCE_MAX,
  MAX_SEATS,
  NERVE_BALANCED,
  NERVE_CAUTIOUS,
  NERVE_RECKLESS,
  PHASE_GAME_OVER,
  PHASE_PLAYING,
  SEAT_BOT,
  SEAT_HUMAN,
} from './push-your-luck-constants';
import { BUST_CARD, bustChanceForDraw, drawSafeCard } from './push-your-luck-deck';
import { PushYourLuckEngine } from './push-your-luck-engine';
import { nextRandom } from './push-your-luck-rng';
import { createInitialPushYourLuckState, createSeats } from './push-your-luck-state';
import { bankPot, endTurn, pushDraw } from './push-your-luck-turn';
import { progressPercent, richestOpponent, riskLevel } from './push-your-luck-utils';

function seat(overrides: Partial<PushYourLuckSeat> = {}): PushYourLuckSeat {
  return {
    id: 'seat-1',
    name: 'Tester',
    avatar: 'D',
    kind: SEAT_HUMAN,
    nerve: NERVE_BALANCED,
    banked: 0,
    insurance: 0,
    busts: 0,
    bestRound: 0,
    ...overrides,
  };
}

function twoSeatState(overrides: Partial<PushYourLuckState> = {}): PushYourLuckState {
  const base = createInitialPushYourLuckState(
    [seat(), seat({ id: 'seat-2', name: 'Rival' })],
    DEFAULT_TARGET_SCORE,
    1,
  );
  return { ...base, ...overrides };
}

/** Finds a seed whose next roll lands inside [low, high). */
function seedWhereRoll(low: number, high: number): number {
  for (let candidate = 1; candidate < 200000; candidate += 1) {
    const { value } = nextRandom(candidate);
    if (value >= low && value < high) return candidate;
  }
  throw new Error(`no seed found for roll range ${low}-${high}`);
}

describe('Push Your Luck - risk escalation', () => {
  it('never busts the opening draw of a turn', () => {
    assert.equal(bustChanceForDraw(1), 0);
  });

  it('escalates the bust chance with every further draw', () => {
    const chances = [2, 3, 4, 5, 6].map(bustChanceForDraw);
    for (let i = 1; i < chances.length; i += 1) {
      assert.ok(chances[i] > chances[i - 1], `draw ${i + 2} should be riskier than draw ${i + 1}`);
    }
  });

  it('caps the bust chance so pushing is never a certainty', () => {
    assert.equal(bustChanceForDraw(50), BUST_CHANCE_MAX);
    assert.equal(riskLevel(BUST_CHANCE_MAX), 1);
  });
});

describe('Push Your Luck - deck', () => {
  it('suppresses multipliers and steals that have no target', () => {
    for (let seed = 1; seed < 400; seed += 1) {
      const { card } = drawSafeCard({ seed, drawIndex: 1, pot: 0, canSteal: false });
      assert.notEqual(card.kind, 'multiplier');
      assert.notEqual(card.kind, 'steal');
    }
  });

  it('pays more for later draws', () => {
    const early = drawSafeCard({ seed: 7, drawIndex: 1, pot: 0, canSteal: false });
    const late = drawSafeCard({ seed: 7, drawIndex: 6, pot: 0, canSteal: false });
    if (early.card.kind === 'points' && late.card.kind === 'points') {
      assert.ok(late.card.value > early.card.value);
    }
  });

  it('is deterministic for a given seed', () => {
    const a = drawSafeCard({ seed: 4242, drawIndex: 3, pot: 10, canSteal: true });
    const b = drawSafeCard({ seed: 4242, drawIndex: 3, pot: 10, canSteal: true });
    assert.deepEqual(a, b);
  });
});

describe('Push Your Luck - pushing and banking', () => {
  it('adds the first draw to the pot without risk', () => {
    const next = pushDraw(twoSeatState());
    assert.equal(next.turn.draws, 1);
    assert.equal(next.lastOutcome, 'safe');
    assert.notEqual(next.lastCard, null);
  });

  it('wipes the pot on a bust and passes the turn', () => {
    const busted = pushDraw(
      twoSeatState({
        seed: seedWhereRoll(0, 0.05),
        turn: { pot: 40, draws: 3, events: [], savedByInsurance: false, resolved: null },
      }),
    );

    assert.equal(busted.lastOutcome, 'bust');
    assert.equal(busted.turn.pot, 0);
    assert.equal(busted.turn.resolved, 'bust');
    assert.equal(busted.seats[0].busts, 1);
    assert.equal(busted.seats[0].banked, 0);

    const passed = endTurn(busted);
    assert.equal(passed.activeSeat, 1);
    assert.equal(passed.turn.pot, 0);
    assert.equal(passed.bustChance, 0);
  });

  it('absorbs a bust with insurance and keeps the pot alive', () => {
    const state = twoSeatState({
      seed: seedWhereRoll(0, 0.05),
      seats: [seat({ insurance: 1 }), seat({ id: 'seat-2', name: 'Rival' })],
      turn: { pot: 26, draws: 4, events: [], savedByInsurance: false, resolved: null },
    });

    const saved = pushDraw(state);
    assert.equal(saved.lastOutcome, 'saved');
    assert.equal(saved.turn.pot, 26);
    assert.equal(saved.turn.resolved, null);
    assert.equal(saved.seats[0].insurance, 0);
    assert.equal(saved.seats[0].busts, 0);
    assert.equal(saved.lastCard, BUST_CARD);
  });

  it('moves the pot into the bank and records the best round', () => {
    const banked = bankPot(
      twoSeatState({
        turn: { pot: 18, draws: 2, events: [], savedByInsurance: false, resolved: null },
      }),
    );

    assert.equal(banked.seats[0].banked, 18);
    assert.equal(banked.seats[0].bestRound, 18);
    assert.equal(banked.turn.resolved, 'banked');
    assert.equal(banked.phase, PHASE_PLAYING);
  });

  it('refuses to act on an already resolved turn', () => {
    const resolved = twoSeatState({
      turn: { pot: 0, draws: 2, events: [], savedByInsurance: false, resolved: 'bust' },
    });
    assert.equal(pushDraw(resolved), resolved);
    assert.equal(bankPot(resolved), resolved);
  });

  it('counts a full rotation as one round', () => {
    let state = twoSeatState();
    state = endTurn(state);
    assert.equal(state.round, 1);
    state = endTurn(state);
    assert.equal(state.round, 2);
    assert.equal(state.activeSeat, 0);
  });
});

describe('Push Your Luck - winning', () => {
  it('ends the match when a bank reaches the target score', () => {
    const state = twoSeatState({
      targetScore: 60,
      seats: [seat({ banked: 50 }), seat({ id: 'seat-2', name: 'Rival' })],
      turn: { pot: 12, draws: 2, events: [], savedByInsurance: false, resolved: null },
    });

    const won = bankPot(state);
    assert.equal(won.phase, PHASE_GAME_OVER);
    assert.equal(won.winnerId, 'seat-1');
    assert.equal(won.seats[0].banked, 62);
    // A finished match is frozen: no further turns, no further draws.
    assert.equal(endTurn(won), won);
    assert.equal(pushDraw(won), won);
  });

  it('never wins on an unbanked pot', () => {
    const state = twoSeatState({
      targetScore: 20,
      turn: { pot: 999, draws: 1, events: [], savedByInsurance: false, resolved: null },
    });
    assert.equal(state.phase, PHASE_PLAYING);
    assert.equal(state.winnerId, null);
  });
});

describe('Push Your Luck - steals', () => {
  it('targets the richest opponent and never the active seat', () => {
    const seats = [
      seat({ banked: 90 }),
      seat({ id: 'seat-2', banked: 30 }),
      seat({ id: 'seat-3', banked: 55 }),
    ];
    assert.equal(richestOpponent(seats, 0)?.id, 'seat-3');
    assert.equal(richestOpponent(seats, 2)?.id, 'seat-1');
  });

  it('has no target when every opponent is empty', () => {
    assert.equal(richestOpponent([seat({ banked: 40 }), seat({ id: 'seat-2' })], 0), null);
  });
});

describe('Push Your Luck - engine surface', () => {
  it('notifies subscribers and blocks a bank with an empty pot', () => {
    const engine = new PushYourLuckEngine(
      [seat(), seat({ id: 'seat-2', name: 'Rival' })],
      DEFAULT_TARGET_SCORE,
      99,
    );

    let notifications = 0;
    const unsubscribe = engine.subscribe(() => {
      notifications += 1;
    });

    assert.equal(engine.bank(), false, 'nothing to bank before the first draw');
    assert.equal(engine.push(), true);
    assert.ok(engine.getState().turn.draws === 1);
    assert.ok(notifications > 0);

    unsubscribe();
    const before = notifications;
    engine.push();
    assert.equal(notifications, before, 'unsubscribed listener must stop receiving state');
  });

  it('clears scores but keeps the roster on reset', () => {
    const engine = new PushYourLuckEngine(
      [seat({ banked: 40, busts: 2 }), seat({ id: 'seat-2', name: 'Rival', banked: 10 })],
      80,
      5,
    );

    engine.resetMatch();
    const state = engine.getState();
    assert.equal(state.seats.length, 2);
    assert.equal(state.seats[0].banked, 0);
    assert.equal(state.seats[0].busts, 0);
    assert.equal(state.targetScore, 80);
    assert.equal(state.activeSeat, 0);
  });
});

describe('Push Your Luck - seat roster', () => {
  it('caps the table at the supported seat count', () => {
    const seats = createSeats({ humanSeats: 6, botSeats: 6, nerve: NERVE_BALANCED });
    assert.equal(seats.length, MAX_SEATS);
  });

  it('pads a solo table with a bot opponent', () => {
    const seats = createSeats({ humanSeats: 1, botSeats: 0, nerve: NERVE_CAUTIOUS });
    assert.equal(seats.length, 2);
    assert.equal(seats[1].kind, SEAT_BOT);
  });

  it('seats the signed-in player first', () => {
    const seats = createSeats({
      humanSeats: 2,
      botSeats: 1,
      nerve: NERVE_BALANCED,
      playerName: 'Hisham',
      playerAvatar: 'F',
    });
    assert.equal(seats[0].name, 'Hisham');
    assert.equal(seats[0].avatar, 'F');
    assert.equal(seats[1].name, 'Player 2');
    assert.equal(seats[2].kind, SEAT_BOT);
  });
});

describe('Push Your Luck - bots', () => {
  it('always takes the free opening draw', () => {
    const state = twoSeatState({
      seats: [seat({ kind: SEAT_BOT, nerve: NERVE_CAUTIOUS }), seat({ id: 'seat-2' })],
    });
    assert.equal(decideBotAction(state), 'push');
  });

  it('banks a pot that wins the match outright', () => {
    const state = twoSeatState({
      targetScore: 60,
      seats: [seat({ kind: SEAT_BOT, nerve: NERVE_RECKLESS, banked: 50 }), seat({ id: 'seat-2' })],
      turn: { pot: 10, draws: 1, events: [], savedByInsurance: false, resolved: null },
      bustChance: 0.06,
    });
    assert.equal(decideBotAction(state), 'bank');
  });

  it('banks earlier the more cautious the nerve', () => {
    const build = (nerve: PushYourLuckSeat['nerve']) =>
      twoSeatState({
        seats: [seat({ kind: SEAT_BOT, nerve }), seat({ id: 'seat-2' })],
        turn: { pot: 16, draws: 3, events: [], savedByInsurance: false, resolved: null },
        bustChance: bustChanceForDraw(4),
      });

    assert.equal(decideBotAction(build(NERVE_CAUTIOUS)), 'bank');
    assert.equal(decideBotAction(build(NERVE_RECKLESS)), 'push');
  });

  it('keeps pushing while it holds insurance', () => {
    const state = twoSeatState({
      seats: [
        seat({ kind: SEAT_BOT, nerve: NERVE_CAUTIOUS, insurance: 1 }),
        seat({ id: 'seat-2' }),
      ],
      turn: { pot: 14, draws: 3, events: [], savedByInsurance: false, resolved: null },
      bustChance: bustChanceForDraw(4),
    });
    assert.equal(decideBotAction(state), 'push');
  });
});

describe('Push Your Luck - progress display', () => {
  it('reports progress toward the target as a clamped percentage', () => {
    assert.equal(progressPercent(0, 100), 0);
    assert.equal(progressPercent(50, 100), 50);
    assert.equal(progressPercent(140, 100), 100);
    assert.equal(progressPercent(10, 0), 0);
  });

  it('never stacks insurance beyond the cap', () => {
    let state = twoSeatState({
      seats: [seat({ insurance: INSURANCE_MAX }), seat({ id: 'seat-2' })],
    });
    for (let i = 0; i < 40; i += 1) {
      state = pushDraw(state);
      if (state.turn.resolved) break;
      assert.ok(state.seats[0].insurance <= INSURANCE_MAX);
    }
  });
});
