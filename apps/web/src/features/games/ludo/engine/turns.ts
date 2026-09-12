import type { LudoGameState } from '../types/ludo.types';
import { PHASE_AWAITING_ROLL } from './ludo-constants';
import { getPlayerBySeat } from './movement';

/**
 * Updates the acting player's consecutive-sixes streak for this roll.
 * Returns `forcedPass: true` when the streak just hit the configured cap
 * (default 3) - the classic "three sixes forfeits the turn" rule.
 */
export function registerRoll(
  state: LudoGameState,
  seatIndex: number,
  diceValue: number,
): { state: LudoGameState; forcedPass: boolean } {
  const player = getPlayerBySeat(state, seatIndex);
  if (!player) return { state, forcedPass: false };

  const nextStreak = diceValue === 6 ? player.consecutiveSixes + 1 : 0;
  const forcedPass = diceValue === 6 && nextStreak >= state.settings.maxConsecutiveSixes;

  const players = state.players.map((p) =>
    p.seatIndex === seatIndex ? { ...p, consecutiveSixes: forcedPass ? 0 : nextStreak } : p,
  );

  return { state: { ...state, players }, forcedPass };
}

export function nextActiveSeatIndex(state: LudoGameState, fromSeatIndex: number): number {
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

export function advanceTurn(state: LudoGameState, fromSeatIndex: number): LudoGameState {
  return {
    ...state,
    currentTurnSeatIndex: nextActiveSeatIndex(state, fromSeatIndex),
    dice: { value: null, rollsThisTurn: 0 },
    turnPhase: PHASE_AWAITING_ROLL,
  };
}

export function grantExtraTurn(state: LudoGameState, seatIndex: number): LudoGameState {
  return {
    ...state,
    currentTurnSeatIndex: seatIndex,
    dice: { value: null, rollsThisTurn: state.dice.rollsThisTurn },
    turnPhase: PHASE_AWAITING_ROLL,
  };
}
