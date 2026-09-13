'use client';

import { useEffect } from 'react';
import type { SudokuStatus } from '../types/sudoku.types';
import type { SudokuControls } from './use-sudoku-engine';

const MOVES: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
  w: [-1, 0],
  s: [1, 0],
  a: [0, -1],
  d: [0, 1],
};

const CLEAR_KEYS = new Set(['Backspace', 'Delete', '0']);
const DIGIT_PATTERN = /^[1-9]$/;

/** Keys we consume so the page does not scroll or fire browser shortcuts. */
const SWALLOWED_KEYS = new Set([...Object.keys(MOVES), ' ', 'Backspace']);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  );
}

/** Pause and restart stay available whatever the run is doing. */
function handleLifecycleKey(key: string, status: SudokuStatus, controls: SudokuControls): boolean {
  if (key === 'p' || key === 'escape') {
    if (status === 'playing') controls.pause();
    else if (status === 'paused') controls.resume();
    return true;
  }

  if (key === 'r') {
    controls.reset();
    return true;
  }

  return false;
}

function handleMovementKey(event: KeyboardEvent, controls: SudokuControls): boolean {
  const move = MOVES[event.key] ?? MOVES[event.key.toLowerCase()];
  if (!move) return false;

  controls.moveSelection(move[0], move[1]);
  return true;
}

/** Digits place a value, or a pencil mark when Shift is held. */
function handleDigitKey(event: KeyboardEvent, controls: SudokuControls): boolean {
  if (!DIGIT_PATTERN.test(event.key)) return false;

  const digit = Number(event.key);
  if (event.shiftKey) controls.toggleCandidate(digit);
  else controls.setDigit(digit);
  return true;
}

function handleToolKey(event: KeyboardEvent, controls: SudokuControls): void {
  const key = event.key.toLowerCase();

  if (CLEAR_KEYS.has(event.key)) {
    controls.clearCell();
  } else if (event.ctrlKey) {
    if (key === 'z') controls.undo();
  } else if (key === 'n' || event.key === ' ') {
    controls.toggleNoteMode();
  } else if (key === 'u') {
    controls.undo();
  } else if (key === 'h') {
    controls.hint();
  }
}

/**
 * Full keyboard play: arrows or WASD to move, 1-9 to place (Shift for a pencil
 * mark), 0/Backspace to erase, N notes, U or Ctrl+Z undo, H hint, P pause,
 * R restart. Number-row and numpad digits both arrive as "1".."9".
 */
export function useSudokuKeyboard(status: SudokuStatus, controls: SudokuControls) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.altKey || event.metaKey) return;
      if (SWALLOWED_KEYS.has(event.key)) event.preventDefault();

      if (handleLifecycleKey(event.key.toLowerCase(), status, controls)) return;
      if (status !== 'playing') return;

      if (handleMovementKey(event, controls)) return;
      if (handleDigitKey(event, controls)) return;
      handleToolKey(event, controls);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, controls]);
}
