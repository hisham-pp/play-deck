import type { ColorThiefGameState, ColorThiefPlayerState } from '../types/color-thief.types';
import { isAbilityReady } from './abilities';
import { BLOCKADE_PAINT_FACTOR, STATUS_COMPLETED, STATUS_PLAYING } from './color-thief-constants';
import { appendLog } from './color-thief-state';
import { canClaim, neutralTilesTouching, paintTile, winnersOf } from './territory';

/** A blockaded seat still gets enough paint for one cheap claim, never zero. */
export function paintAllowanceFor(
  state: ColorThiefGameState,
  player: ColorThiefPlayerState,
): number {
  const base = state.settings.paintPerTurn;
  if (player.blockadedTurns <= 0) return base;
  return Math.max(1, Math.floor(base * BLOCKADE_PAINT_FACTOR));
}

function seatOrder(state: ColorThiefGameState): number[] {
  return state.players.map((player) => player.seatIndex).sort((a, b) => a - b);
}

/** True once a single seat owns every tile — nobody left to steal from. */
function isBoardConquered(state: ColorThiefGameState): boolean {
  const owners = new Set(state.board.map((tile) => tile.owner));
  return owners.size === 1 && !owners.has(null);
}

export function completeMatch(state: ColorThiefGameState, reason: string): ColorThiefGameState {
  return {
    ...state,
    status: STATUS_COMPLETED,
    winnerIds: winnersOf(state),
    log: appendLog(state.log, {
      kind: 'system',
      seatIndex: null,
      message: reason,
      round: state.round,
    }),
  };
}

/**
 * Green's passive. Deterministic on purpose: every client picks the same
 * lowest-index neutral tile, so the creep needs no host authority and no RNG.
 */
function applyBloom(
  state: ColorThiefGameState,
  player: ColorThiefPlayerState,
): ColorThiefGameState {
  if (player.ability !== 'bloom') return state;

  const [target] = neutralTilesTouching(state, player.seatIndex);
  if (target === undefined) return state;

  return {
    ...state,
    board: paintTile(state.board, target, player.seatIndex, state.actionCount),
    players: state.players.map((p) =>
      p.seatIndex === player.seatIndex ? { ...p, abilityRevealed: true } : p,
    ),
    log: appendLog(state.log, {
      kind: 'ability',
      seatIndex: player.seatIndex,
      message: 'Bloom creeps onto one more tile',
      round: state.round,
    }),
  };
}

/** Hands the arena to `seatIndex`: settles their blockade, paint and passives. */
export function beginTurn(state: ColorThiefGameState, seatIndex: number): ColorThiefGameState {
  const player = state.players.find((p) => p.seatIndex === seatIndex);
  if (!player) return state;

  const started: ColorThiefGameState = {
    ...state,
    currentTurnSeatIndex: seatIndex,
    paintRemaining: paintAllowanceFor(state, player),
    players: state.players.map((p) =>
      p.seatIndex === seatIndex ? { ...p, blockadedTurns: Math.max(0, p.blockadedTurns - 1) } : p,
    ),
  };

  return applyBloom(started, player);
}

/**
 * Passes the brush along, rolling the round over when the table wraps and
 * scoring the arena once the configured rounds are spent.
 */
export function advanceTurn(state: ColorThiefGameState): ColorThiefGameState {
  if (isBoardConquered(state)) {
    return completeMatch(state, 'One colour owns the whole arena');
  }

  const order = seatOrder(state);
  const position = order.indexOf(state.currentTurnSeatIndex);
  const nextPosition = (position + 1) % order.length;
  const wrapped = nextPosition <= position;
  const round = wrapped ? state.round + 1 : state.round;

  if (round > state.settings.totalRounds) {
    return completeMatch(
      { ...state, round: state.settings.totalRounds },
      'The paint is dry — final count',
    );
  }

  const rolled: ColorThiefGameState = wrapped
    ? {
        ...state,
        round,
        log: appendLog(state.log, {
          kind: 'turn',
          seatIndex: null,
          message: `Round ${round} of ${state.settings.totalRounds}`,
          round,
        }),
      }
    : state;

  return beginTurn(rolled, order[nextPosition]);
}

export function isSeatOnTurn(state: ColorThiefGameState, seatIndex: number): boolean {
  return state.status === STATUS_PLAYING && state.currentTurnSeatIndex === seatIndex;
}

/**
 * Whether the seat can still do anything with the paint it has left. Paint
 * never carries over, so a turn with no affordable move is simply finished.
 */
export function hasAffordableMove(state: ColorThiefGameState, seatIndex: number): boolean {
  if (state.paintRemaining <= 0) return false;
  if (state.board.some((tile) => canClaim(state, tile.index, seatIndex))) return true;

  const player = state.players.find((p) => p.seatIndex === seatIndex);
  return Boolean(player && isAbilityReady(state, player));
}
