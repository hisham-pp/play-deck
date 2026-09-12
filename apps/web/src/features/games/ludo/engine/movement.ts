import { finishSteps, resolveLayout } from './board-layout';
import type {
  LudoAction,
  LudoGameState,
  LudoPieceState,
  LudoPlayerState,
  LudoRuleSettings,
} from '../types/ludo.types';

export function getPlayerBySeat(
  state: LudoGameState,
  seatIndex: number,
): LudoPlayerState | undefined {
  return state.players.find((p) => p.seatIndex === seatIndex);
}

export function getPlayerById(state: LudoGameState, playerId: string): LudoPlayerState | undefined {
  return state.players.find((p) => p.playerId === playerId);
}

/**
 * Returns the resulting `steps` value for a piece advancing by `diceValue`,
 * or null if the move is illegal (leaving base without a 6, or overshooting
 * home when an exact roll is required).
 */
export function computeDestinationSteps(
  piece: LudoPieceState,
  diceValue: number,
  settings: LudoRuleSettings,
  layout: ReturnType<typeof resolveLayout>,
): number | null {
  const finish = finishSteps(layout);

  if (piece.location === 'home') {
    return null;
  }

  if (piece.location === 'base') {
    if (settings.requireSixToExitBase && diceValue !== 6) {
      return null;
    }
    return 1;
  }

  const destination = piece.steps + diceValue;
  if (destination > finish) {
    if (settings.requireExactRollToFinish) {
      return null;
    }
    return finish;
  }
  return destination;
}

export function canPieceMove(
  piece: LudoPieceState,
  diceValue: number,
  settings: LudoRuleSettings,
  layout: ReturnType<typeof resolveLayout>,
): boolean {
  return computeDestinationSteps(piece, diceValue, settings, layout) !== null;
}

export function computeLegalMoveActions(
  state: LudoGameState,
  seatIndex: number,
  diceValue: number,
): LudoAction[] {
  const player = getPlayerBySeat(state, seatIndex);
  if (!player) return [];

  const layout = resolveLayout(state.players.length);
  const actions: LudoAction[] = [];

  for (const piece of player.pieces) {
    if (canPieceMove(piece, diceValue, state.settings, layout)) {
      actions.push({
        type: 'MOVE_PIECE',
        playerId: player.playerId,
        payload: { pieceId: piece.id },
      });
    }
  }

  return actions;
}

export function locatePiece(state: LudoGameState, pieceId: string): LudoPieceState | undefined {
  for (const player of state.players) {
    const piece = player.pieces.find((p) => p.id === pieceId);
    if (piece) return piece;
  }
  return undefined;
}
