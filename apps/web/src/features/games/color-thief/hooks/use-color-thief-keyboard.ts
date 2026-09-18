'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { toColumn, toRow } from '../engine/grid';

const STEP_BY_KEY: Record<string, [column: number, row: number]> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
};

export interface UseColorThiefKeyboardOptions {
  columns: number;
  rows: number;
  onActivate: (index: number) => void;
  onEndTurn: () => void;
  onAbility: () => void;
  onCancel: () => void;
}

export interface UseColorThiefKeyboardReturn {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  /** Attach to the grid container; tiles themselves stay plain buttons. */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  registerTile: (index: number) => (node: HTMLButtonElement | null) => void;
}

/**
 * Roving tabindex over the grid. One tile is in the tab order at a time and the
 * arrow keys move real DOM focus between them, so the board is navigable
 * without a mouse and a screen reader reads each tile as it is reached.
 */
export function useColorThiefKeyboard({
  columns,
  rows,
  onActivate,
  onEndTurn,
  onAbility,
  onCancel,
}: UseColorThiefKeyboardOptions): UseColorThiefKeyboardReturn {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const tilesRef = useRef(new Map<number, HTMLButtonElement>());
  // Focus only follows the keyboard, never a render, or a bot's move would
  // steal focus away from whatever the player was doing.
  const shouldFocusRef = useRef(false);

  useEffect(() => {
    if (!shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    tilesRef.current.get(focusedIndex)?.focus();
  }, [focusedIndex]);

  const registerTile = useCallback(
    (index: number) => (node: HTMLButtonElement | null) => {
      if (node) tilesRef.current.set(index, node);
      else tilesRef.current.delete(index);
    },
    [],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const key = event.key;

      if (key === 'Escape') {
        onCancel();
        return;
      }
      if (key === 'e' || key === 'E') {
        event.preventDefault();
        onEndTurn();
        return;
      }
      if (key === 'q' || key === 'Q') {
        event.preventDefault();
        onAbility();
        return;
      }
      if (key === 'Enter' || key === ' ') {
        event.preventDefault();
        onActivate(focusedIndex);
        return;
      }

      const step = STEP_BY_KEY[key];
      if (!step) return;

      event.preventDefault();
      const [dx, dy] = step;
      const column = Math.min(columns - 1, Math.max(0, toColumn(focusedIndex, columns) + dx));
      const row = Math.min(rows - 1, Math.max(0, toRow(focusedIndex, columns) + dy));

      shouldFocusRef.current = true;
      setFocusedIndex(row * columns + column);
    },
    [columns, rows, focusedIndex, onAbility, onActivate, onCancel, onEndTurn],
  );

  return { focusedIndex, setFocusedIndex, onKeyDown, registerTile };
}
