import type {
  SnakeLadderGameState,
  SnakeLadderPlayerState,
  SnakeLadderRuleSettings,
} from '../types/snake-and-ladder.types';
import { jumpAt } from './board-layout';
import { DICE_MAX, FINAL_SQUARE, START_SQUARE } from './snake-ladder-constants';

export function getPlayerBySeat(
  state: SnakeLadderGameState,
  seatIndex: number,
): SnakeLadderPlayerState | undefined {
  return state.players.find((player) => player.seatIndex === seatIndex);
}

export function getPlayerById(
  state: SnakeLadderGameState,
  playerId: string,
): SnakeLadderPlayerState | undefined {
  return state.players.find((player) => player.playerId === playerId);
}

export interface ResolvedWalk {
  /** Square reached by walking the dice out, before any snake or ladder. */
  walkTo: number;
  /** True when the exact-finish rule kept the token where it started. */
  overshot: boolean;
}

/**
 * Walks `dice` squares from `from`, applying the end-of-board rule. With
 * `requireExactRollToFinish` an overshoot forfeits the move; otherwise the
 * token bounces back off square 100.
 */
export function resolveWalk(
  from: number,
  dice: number,
  settings: SnakeLadderRuleSettings,
): ResolvedWalk {
  const raw = from + dice;
  if (raw <= FINAL_SQUARE) return { walkTo: raw, overshot: false };

  if (settings.requireExactRollToFinish) return { walkTo: from, overshot: true };

  return { walkTo: FINAL_SQUARE - (raw - FINAL_SQUARE), overshot: false };
}

/** A token still in the start pocket that the six-to-start rule holds back. */
export function isHeldAtStart(
  position: number,
  dice: number,
  settings: SnakeLadderRuleSettings,
): boolean {
  return settings.requireSixToStart && position === START_SQUARE && dice !== DICE_MAX;
}

export interface ResolvedTurn extends ResolvedWalk {
  to: number;
  jump: ReturnType<typeof jumpAt>;
  won: boolean;
  /** True when the six-to-start rule kept the token in its pocket. */
  blockedAtStart: boolean;
}

/** The complete outcome of one roll: the walk, any snake or ladder, and the win. */
export function resolveTurn(
  position: number,
  dice: number,
  settings: SnakeLadderRuleSettings,
): ResolvedTurn {
  if (isHeldAtStart(position, dice, settings)) {
    return {
      walkTo: position,
      to: position,
      jump: null,
      overshot: false,
      won: false,
      blockedAtStart: true,
    };
  }

  const { walkTo, overshot } = resolveWalk(position, dice, settings);
  if (walkTo === position) {
    return { walkTo, to: position, jump: null, overshot, won: false, blockedAtStart: false };
  }

  const jump = jumpAt(walkTo);
  const to = jump ? jump.to : walkTo;

  return { walkTo, to, jump, overshot, won: to === FINAL_SQUARE, blockedAtStart: false };
}
