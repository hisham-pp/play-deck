import type {
  SnakeLadderAction,
  SnakeLadderGameState,
  SnakeLadderMove,
  SnakeLadderPlayerState,
} from '../types/snake-and-ladder.types';
import { getPlayerById, getPlayerBySeat, resolveTurn } from './movement';
import {
  DICE_MAX,
  DICE_MIN,
  STATUS_COMPLETED,
  STATUS_PAUSED,
  STATUS_PLAYING,
  STATUS_WAITING,
} from './snake-ladder-constants';
import { advanceTurn, registerRoll } from './turns';

function describeMove(move: SnakeLadderMove): string {
  if (move.won) return 'Home on 100 — winner!';
  if (move.overshot) return `Rolled ${move.dice} — needs an exact roll to finish`;
  if (move.blockedAtStart) return `Rolled ${move.dice} — a six is needed to start`;
  if (move.jump?.kind === 'ladder') return `Ladder from ${move.jump.from} up to ${move.jump.to}`;
  if (move.jump?.kind === 'snake') return `Snake from ${move.jump.from} down to ${move.jump.to}`;
  return `Moved to ${move.to}`;
}

function isRollable(state: SnakeLadderGameState, playerId: string): boolean {
  if (state.status !== STATUS_PLAYING) return false;
  const actor = getPlayerById(state, playerId);
  if (!actor || actor.finished) return false;
  return actor.seatIndex === state.currentTurnSeatIndex;
}

/** A roll that never moves the token: the third six, or a forfeited turn. */
function stillMove(
  state: SnakeLadderGameState,
  player: SnakeLadderPlayerState,
  value: number,
): SnakeLadderMove {
  return {
    moveId: state.moveCount,
    playerId: player.playerId,
    seatIndex: player.seatIndex,
    dice: value,
    from: player.position,
    walkTo: player.position,
    to: player.position,
    jump: null,
    overshot: false,
    blockedAtStart: false,
    won: false,
  };
}

function settleMove(
  state: SnakeLadderGameState,
  player: SnakeLadderPlayerState,
  value: number,
): SnakeLadderGameState {
  const seatIndex = player.seatIndex;
  const outcome = resolveTurn(player.position, value, state.settings);

  const players = state.players.map((p) =>
    p.seatIndex === seatIndex
      ? {
          ...p,
          position: outcome.to,
          finished: outcome.won || p.finished,
          finishRank: outcome.won ? state.winnerOrder.length + 1 : p.finishRank,
        }
      : p,
  );

  const move: SnakeLadderMove = {
    moveId: state.moveCount,
    playerId: player.playerId,
    seatIndex,
    dice: value,
    from: player.position,
    walkTo: outcome.walkTo,
    to: outcome.to,
    jump: outcome.jump,
    overshot: outcome.overshot,
    blockedAtStart: outcome.blockedAtStart,
    won: outcome.won,
  };

  const winnerOrder = outcome.won ? [...state.winnerOrder, player.playerId] : state.winnerOrder;
  // A match is over once the places that matter are settled: the configured
  // first-finisher cut, or nobody left to race.
  const matchOver =
    (outcome.won && state.settings.endOnFirstFinisher) ||
    players.filter((p) => !p.finished).length <= 1;

  const settled: SnakeLadderGameState = {
    ...state,
    players,
    winnerOrder,
    lastMove: move,
    lastMoveNote: describeMove(move),
    status: matchOver ? STATUS_COMPLETED : state.status,
  };

  if (matchOver) return settled;

  // A six keeps the dice with the same seat, but only while they are still racing.
  const keepsTurn = value === DICE_MAX && settled.settings.sixGrantsExtraTurn && !outcome.won;
  return keepsTurn ? settled : advanceTurn(settled, seatIndex);
}

function applyRoll(
  state: SnakeLadderGameState,
  playerId: string,
  value: number,
): SnakeLadderGameState {
  if (!Number.isInteger(value) || value < DICE_MIN || value > DICE_MAX) return state;
  if (!isRollable(state, playerId)) return state;

  const seatIndex = getPlayerById(state, playerId)!.seatIndex;
  const { state: streakState, forcedPass } = registerRoll(state, seatIndex, value);
  const player = getPlayerBySeat(streakState, seatIndex)!;

  const rolled: SnakeLadderGameState = {
    ...streakState,
    dice: { value, rollsThisTurn: streakState.dice.rollsThisTurn + 1 },
    moveCount: streakState.moveCount + 1,
  };

  // Three sixes in a row burns the turn outright: the token never moves.
  if (forcedPass) {
    return advanceTurn(
      {
        ...rolled,
        lastMove: stillMove(rolled, player, value),
        lastMoveNote: `${rolled.settings.maxConsecutiveSixes} sixes in a row — turn forfeited`,
      },
      seatIndex,
    );
  }

  return settleMove(rolled, player, value);
}

export function snakeLadderReducer(
  state: SnakeLadderGameState,
  action: SnakeLadderAction,
): SnakeLadderGameState {
  switch (action.type) {
    case 'START_GAME': {
      if (state.status !== STATUS_WAITING) return state;
      if (state.players.length < 2) return state;
      return { ...state, status: STATUS_PLAYING, lastMoveNote: null };
    }

    case 'PAUSE_GAME':
      return state.status === STATUS_PLAYING ? { ...state, status: STATUS_PAUSED } : state;

    case 'RESUME_GAME':
      return state.status === STATUS_PAUSED ? { ...state, status: STATUS_PLAYING } : state;

    case 'END_GAME':
      return state.status === STATUS_COMPLETED ? state : { ...state, status: STATUS_COMPLETED };

    case 'ROLL_DICE':
      return applyRoll(state, action.playerId, action.payload.value);

    default:
      return state;
  }
}
