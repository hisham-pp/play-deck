import type { LudoAction, LudoGameState, LudoPieceLocation } from '../types/ludo.types';
import { resolveLayout } from './board-layout';
import { isFinishedSteps, isHomeStretchSteps, isTrackSteps } from './board-layout';
import { applyCaptureIfAny } from './capture';
import {
  PHASE_AWAITING_MOVE,
  PHASE_AWAITING_ROLL,
  STATUS_COMPLETED,
  STATUS_PAUSED,
  STATUS_PLAYING,
  STATUS_WAITING,
} from './ludo-constants';
import {
  computeDestinationSteps,
  computeLegalMoveActions,
  getPlayerById,
  locatePiece,
} from './movement';
import { advanceTurn, grantExtraTurn, registerRoll } from './turns';
import { checkGameCompletion, checkPlayerFinished } from './win-condition';

function appendToLog(state: LudoGameState, action: LudoAction): LudoGameState {
  return { ...state, actionLog: [...state.actionLog, action] };
}

function handleRollDice(
  state: LudoGameState,
  action: Extract<LudoAction, { type: 'ROLL_DICE' }>,
): LudoGameState {
  if (state.status !== STATUS_PLAYING) return state;

  const player = getPlayerById(state, action.playerId);
  if (!player || player.seatIndex !== state.currentTurnSeatIndex) return state;
  if (state.turnPhase !== PHASE_AWAITING_ROLL) return state;

  const diceValue = action.payload.value;
  if (!Number.isInteger(diceValue) || diceValue < 1 || diceValue > 6) return state;

  const seatIndex = player.seatIndex;
  let next = appendToLog(state, action);

  const { state: rolledState, forcedPass } = registerRoll(next, seatIndex, diceValue);
  next = rolledState;

  if (forcedPass) {
    next = {
      ...next,
      dice: { value: diceValue, rollsThisTurn: next.dice.rollsThisTurn + 1 },
      lastMoveNote: 'Three sixes in a row — turn forfeited.',
    };
    return advanceTurn(next, seatIndex);
  }

  const legalMoves = computeLegalMoveActions(next, seatIndex, diceValue);
  next = {
    ...next,
    dice: { value: diceValue, rollsThisTurn: next.dice.rollsThisTurn + 1 },
    lastMoveNote: null,
  };

  if (legalMoves.length === 0) {
    next = { ...next, lastMoveNote: 'No legal moves available.' };
    if (diceValue === 6 && next.settings.sixGrantsExtraTurn) {
      return grantExtraTurn(next, seatIndex);
    }
    return advanceTurn(next, seatIndex);
  }

  return { ...next, turnPhase: PHASE_AWAITING_MOVE };
}

function resolveNextLocation(
  layout: ReturnType<typeof resolveLayout>,
  destinationSteps: number,
): LudoPieceLocation {
  if (isFinishedSteps(layout, destinationSteps)) return 'home';
  if (isHomeStretchSteps(layout, destinationSteps)) return 'home-stretch';
  if (isTrackSteps(layout, destinationSteps)) return 'track';
  return 'base';
}

function handleMovePiece(
  state: LudoGameState,
  action: Extract<LudoAction, { type: 'MOVE_PIECE' }>,
): LudoGameState {
  if (state.status !== STATUS_PLAYING) return state;

  const player = getPlayerById(state, action.playerId);
  if (!player || player.seatIndex !== state.currentTurnSeatIndex) return state;
  if (state.turnPhase !== PHASE_AWAITING_MOVE || state.dice.value === null) return state;

  const diceValue = state.dice.value;
  const seatIndex = player.seatIndex;

  const legalMoves = computeLegalMoveActions(state, seatIndex, diceValue);
  const isLegal = legalMoves.some(
    (candidate) =>
      candidate.type === 'MOVE_PIECE' && candidate.payload.pieceId === action.payload.pieceId,
  );
  if (!isLegal) return state;

  const piece = locatePiece(state, action.payload.pieceId);
  if (!piece) return state;

  const layout = resolveLayout(state.players.length);
  const destinationSteps = computeDestinationSteps(piece, diceValue, state.settings, layout);
  if (destinationSteps === null) return state;

  const nextLocation = resolveNextLocation(layout, destinationSteps);
  const movedPiece = { ...piece, steps: destinationSteps, location: nextLocation };

  let next = appendToLog(state, action);
  next = {
    ...next,
    players: next.players.map((p) =>
      p.playerId === player.playerId
        ? { ...p, pieces: p.pieces.map((pc) => (pc.id === piece.id ? movedPiece : pc)) }
        : p,
    ),
  };

  const captureResult = applyCaptureIfAny(next, layout, movedPiece);
  next = captureResult.state;
  const hasCaptured = captureResult.capturedPieceIds.length > 0;
  const reachedHome = nextLocation === 'home';

  next = {
    ...next,
    lastMoveNote: hasCaptured
      ? 'A piece was captured! Bonus roll awarded.'
      : reachedHome
        ? 'Piece reached home! Bonus roll awarded.'
        : null,
  };

  next = checkPlayerFinished(next, seatIndex);
  next = checkGameCompletion(next);

  if (next.status === STATUS_COMPLETED) {
    return { ...next, turnPhase: 'turn-end' };
  }

  const moverStillActive = getPlayerById(next, player.playerId);
  const earnedExtraTurn =
    !moverStillActive?.finished &&
    ((diceValue === 6 && next.settings.sixGrantsExtraTurn) || hasCaptured || reachedHome);

  if (earnedExtraTurn) {
    return grantExtraTurn(next, seatIndex);
  }

  return advanceTurn(next, seatIndex);
}

export function ludoReducer(state: LudoGameState, action: LudoAction): LudoGameState {
  switch (action.type) {
    case 'START_GAME': {
      if (state.status !== STATUS_WAITING) return state;
      return {
        ...appendToLog(state, action),
        status: STATUS_PLAYING,
        turnPhase: PHASE_AWAITING_ROLL,
      };
    }

    case 'PAUSE_GAME': {
      if (state.status !== STATUS_PLAYING) return state;
      return { ...appendToLog(state, action), status: STATUS_PAUSED };
    }

    case 'RESUME_GAME': {
      if (state.status !== STATUS_PAUSED) return state;
      return { ...appendToLog(state, action), status: STATUS_PLAYING };
    }

    case 'END_GAME': {
      if (state.status === STATUS_COMPLETED) return state;
      return { ...appendToLog(state, action), status: STATUS_COMPLETED };
    }

    case 'ROLL_DICE': {
      return handleRollDice(state, action);
    }

    case 'MOVE_PIECE': {
      return handleMovePiece(state, action);
    }

    default:
      return state;
  }
}
