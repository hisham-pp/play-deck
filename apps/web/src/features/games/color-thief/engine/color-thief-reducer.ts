import type {
  ColorThiefAction,
  ColorThiefGameState,
  ColorThiefPlayerState,
} from '../types/color-thief.types';
import { abilityOf, areTargetsValid, isAbilityReady, resolveAbility } from './abilities';
import {
  MIN_SEATS,
  STATUS_COMPLETED,
  STATUS_PAUSED,
  STATUS_PLAYING,
  STATUS_WAITING,
} from './color-thief-constants';
import { appendLog } from './color-thief-state';
import {
  advanceTurn,
  beginTurn,
  completeMatch,
  hasAffordableMove,
  isSeatOnTurn,
} from './color-thief-turn';
import { paintTile, quoteClaim } from './territory';

/** The seat acting, but only when it is genuinely their turn to act. */
function actorOnTurn(state: ColorThiefGameState, playerId: string): ColorThiefPlayerState | null {
  const player = state.players.find((p) => p.playerId === playerId);
  if (!player || !isSeatOnTurn(state, player.seatIndex)) return null;
  return player;
}

/**
 * Paint never carries between turns, so a seat with nothing left it can afford
 * has finished whether or not it presses End Turn.
 */
function passIfSpent(state: ColorThiefGameState, seatIndex: number): ColorThiefGameState {
  if (state.status !== STATUS_PLAYING) return state;
  if (hasAffordableMove(state, seatIndex)) return state;
  return advanceTurn(state);
}

function applyClaim(
  state: ColorThiefGameState,
  playerId: string,
  index: number,
): ColorThiefGameState {
  const player = actorOnTurn(state, playerId);
  if (!player) return state;

  const quote = quoteClaim(state, index, player.seatIndex);
  if (quote.refusal !== null) return state;

  const actionCount = state.actionCount + 1;
  const stolen = state.board[index].owner !== null;

  const painted: ColorThiefGameState = {
    ...state,
    actionCount,
    board: paintTile(state.board, index, player.seatIndex, actionCount),
    paintRemaining: state.paintRemaining - quote.cost,
    log: appendLog(state.log, {
      kind: 'claim',
      seatIndex: player.seatIndex,
      message: `${stolen ? 'Stole' : 'Claimed'} a tile for ${quote.cost} paint${quote.adjacent ? '' : ' (isolated)'}`,
      round: state.round,
    }),
  };

  return passIfSpent(painted, player.seatIndex);
}

function applyAbility(
  state: ColorThiefGameState,
  playerId: string,
  targets: number[],
): ColorThiefGameState {
  const player = actorOnTurn(state, playerId);
  if (!player) return state;
  if (!isAbilityReady(state, player)) return state;
  if (!areTargetsValid(state, player.seatIndex, targets)) return state;

  const ability = abilityOf(player);
  const actionCount = state.actionCount + 1;
  const outcome = resolveAbility({ ...state, actionCount }, player.seatIndex, targets);
  if (!outcome) return state;

  const blockaded = new Set(outcome.blockadedSeats);

  const applied: ColorThiefGameState = {
    ...state,
    actionCount,
    board: outcome.board,
    paintRemaining: state.paintRemaining - ability.paintCost,
    players: state.players.map((p) => {
      const blockadedTurns = blockaded.has(p.seatIndex) ? p.blockadedTurns + 1 : p.blockadedTurns;
      if (p.seatIndex !== player.seatIndex) return { ...p, blockadedTurns };
      return {
        ...p,
        blockadedTurns,
        // The table learns what a colour does the moment it is used, never before.
        abilityRevealed: true,
        abilityReadyOnRound: state.round + ability.cooldownRounds,
      };
    }),
    log: appendLog(state.log, {
      kind: 'ability',
      seatIndex: player.seatIndex,
      message: `${ability.name}: ${outcome.message}`,
      round: state.round,
    }),
  };

  return passIfSpent(applied, player.seatIndex);
}

function applyEndTurn(state: ColorThiefGameState, playerId: string): ColorThiefGameState {
  const player = actorOnTurn(state, playerId);
  if (!player) return state;
  return advanceTurn(state);
}

export function colorThiefReducer(
  state: ColorThiefGameState,
  action: ColorThiefAction,
): ColorThiefGameState {
  switch (action.type) {
    case 'START_GAME': {
      if (state.status !== STATUS_WAITING) return state;
      if (state.players.length < MIN_SEATS) return state;

      const opened: ColorThiefGameState = {
        ...state,
        status: STATUS_PLAYING,
        log: appendLog(state.log, {
          kind: 'system',
          seatIndex: null,
          message: `Round 1 of ${state.settings.totalRounds} — the grid is neutral`,
          round: state.round,
        }),
      };
      return beginTurn(opened, state.currentTurnSeatIndex);
    }

    case 'PAUSE_GAME':
      return state.status === STATUS_PLAYING ? { ...state, status: STATUS_PAUSED } : state;

    case 'RESUME_GAME':
      return state.status === STATUS_PAUSED ? { ...state, status: STATUS_PLAYING } : state;

    case 'END_GAME':
      return state.status === STATUS_COMPLETED ? state : completeMatch(state, 'Match called early');

    case 'CLAIM_TILE':
      return applyClaim(state, action.playerId, action.payload.index);

    case 'USE_ABILITY':
      return applyAbility(state, action.playerId, action.payload.targets);

    case 'END_TURN':
      return applyEndTurn(state, action.playerId);

    default:
      return state;
  }
}
