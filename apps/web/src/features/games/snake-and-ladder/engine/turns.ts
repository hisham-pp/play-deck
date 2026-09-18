import type { SnakeLadderGameState } from '../types/snake-and-ladder.types';
import { getPlayerBySeat } from './movement';
import { DICE_MAX } from './snake-ladder-constants';

/**
 * Updates the acting seat's consecutive-sixes streak. Returns
 * `forcedPass: true` when the streak just hit the cap — the classic
 * "three sixes in a row forfeits the turn" rule.
 */
export function registerRoll(
  state: SnakeLadderGameState,
  seatIndex: number,
  diceValue: number,
): { state: SnakeLadderGameState; forcedPass: boolean } {
  const player = getPlayerBySeat(state, seatIndex);
  if (!player) return { state, forcedPass: false };

  const nextStreak = diceValue === DICE_MAX ? player.consecutiveSixes + 1 : 0;
  const forcedPass = diceValue === DICE_MAX && nextStreak >= state.settings.maxConsecutiveSixes;

  const players = state.players.map((p) =>
    p.seatIndex === seatIndex ? { ...p, consecutiveSixes: forcedPass ? 0 : nextStreak } : p,
  );

  return { state: { ...state, players }, forcedPass };
}

export function nextActiveSeatIndex(state: SnakeLadderGameState, fromSeatIndex: number): number {
  const seatIndexes = state.players.map((p) => p.seatIndex).sort((a, b) => a - b);
  const count = seatIndexes.length;
  const currentPos = seatIndexes.indexOf(fromSeatIndex);

  for (let step = 1; step <= count; step++) {
    const candidateSeat = seatIndexes[(currentPos + step) % count];
    const candidate = getPlayerBySeat(state, candidateSeat);
    if (candidate && !candidate.finished) {
      return candidateSeat;
    }
  }
  return fromSeatIndex;
}

export function advanceTurn(
  state: SnakeLadderGameState,
  fromSeatIndex: number,
): SnakeLadderGameState {
  return {
    ...state,
    currentTurnSeatIndex: nextActiveSeatIndex(state, fromSeatIndex),
    dice: { value: state.dice.value, rollsThisTurn: 0 },
  };
}
