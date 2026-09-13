'use client';

import { useEffect, useRef } from 'react';
import { isPlainKeypress, isTypingTarget } from '../utils/keyboard';

const AUTO_MOVE_DELAY_MS = 300;

/** The piece a key press picks, if it picks one at all. */
function pickedPieceId(event: KeyboardEvent, pieceIds: string[]): string | null {
  if (!isPlainKeypress(event) || event.key.length !== 1 || isTypingTarget()) return null;

  const choice = Number(event.key);
  if (!Number.isInteger(choice) || choice < 1) return null;

  return pieceIds[choice - 1] ?? null;
}

/**
 * Turns the number keys into the piece picker. Every movable piece wears its
 * own number on the board, so 1..N is the whole selection UI — nothing has to
 * be listed under the board for the player to tell the pieces apart.
 *
 * Also plays the only legal move for the player when there is exactly one,
 * after a short beat so the move still reads as a move.
 */
export function useLudoPieceSelection(
  pieceIds: string[],
  enabled: boolean,
  onSelectPiece: (pieceId: string) => void,
): void {
  // The array identity changes every render; its contents rarely do.
  const key = pieceIds.join('|');
  const pieceIdsRef = useRef(pieceIds);
  pieceIdsRef.current = pieceIds;

  useEffect(() => {
    if (!enabled || pieceIdsRef.current.length !== 1) return;
    const timer = setTimeout(() => onSelectPiece(pieceIdsRef.current[0]), AUTO_MOVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [enabled, key, onSelectPiece]);

  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      const pieceId = pickedPieceId(e, pieceIdsRef.current);
      if (!pieceId) return;
      e.preventDefault();
      onSelectPiece(pieceId);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, key, onSelectPiece]);
}
