import type { BoardLayout } from './board-layout';
import { globalTrackIndex, isSafeCell } from './board-layout';
import type { LudoColor, LudoGameState, LudoPieceState } from '../types/ludo.types';

/**
 * Pure lookup (no mutation): which opponent piece ids would be captured if a
 * piece of `movingColor` landed on shared-track `targetIndex` right now.
 * Two same-color pieces stacked on a cell are treated as safe from capture.
 * Shared by the reducer (to actually apply a capture) and by bot evaluation
 * (to score a candidate move without committing to it).
 */
export function findCapturableOpponentPieceIds(
  state: LudoGameState,
  layout: BoardLayout,
  movingColor: LudoColor,
  targetIndex: number,
): string[] {
  if (isSafeCell(layout, targetIndex)) return [];

  const opponentPiecesByColor = new Map<string, LudoPieceState[]>();
  for (const player of state.players) {
    if (player.color === movingColor) continue;
    for (const piece of player.pieces) {
      if (piece.location !== 'track') continue;
      if (globalTrackIndex(layout, piece.color, piece.steps) !== targetIndex) continue;
      const bucket = opponentPiecesByColor.get(piece.color) ?? [];
      bucket.push(piece);
      opponentPiecesByColor.set(piece.color, bucket);
    }
  }

  const capturedPieceIds: string[] = [];
  for (const bucket of opponentPiecesByColor.values()) {
    if (bucket.length === 1) {
      capturedPieceIds.push(bucket[0].id);
    }
  }
  return capturedPieceIds;
}

/**
 * Sends an opponent piece back to base when a moving piece lands exactly on
 * its track cell. Two same-color pieces stacked on one cell are treated as
 * safe from capture (deliberately simplified: this does NOT also block
 * passage the way a "blockade" house rule would - see plan notes).
 */
export function applyCaptureIfAny(
  state: LudoGameState,
  layout: BoardLayout,
  movedPiece: LudoPieceState,
): { state: LudoGameState; capturedPieceIds: string[] } {
  if (movedPiece.location !== 'track') {
    return { state, capturedPieceIds: [] };
  }

  const targetIndex = globalTrackIndex(layout, movedPiece.color, movedPiece.steps);
  const capturedPieceIds = findCapturableOpponentPieceIds(
    state,
    layout,
    movedPiece.color,
    targetIndex,
  );

  if (capturedPieceIds.length === 0) {
    return { state, capturedPieceIds: [] };
  }

  const capturedSet = new Set(capturedPieceIds);
  const nextPlayers = state.players.map((player) => ({
    ...player,
    pieces: player.pieces.map((piece) =>
      capturedSet.has(piece.id) ? { ...piece, location: 'base' as const, steps: 0 } : piece,
    ),
  }));

  return { state: { ...state, players: nextPlayers }, capturedPieceIds };
}
