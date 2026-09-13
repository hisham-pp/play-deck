import { useEffect, useState } from 'react';
import { COLS } from '../engine/connect-four-constants';

interface UseConnectFourKeyboardOptions {
  onDrop: (column: number) => void;
  onResetRound: () => void;
  isEnabled?: boolean;
}

function isTypingInInput(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

function getNumberKeyColumn(key: string): number | null {
  if (/^[1-7]$/.test(key)) {
    return parseInt(key, 10) - 1;
  }
  return null;
}

function getNextArrowColumn(current: number, key: string): number | null {
  if (key === 'ArrowLeft') return current > 0 ? current - 1 : COLS - 1;
  if (key === 'ArrowRight') return current < COLS - 1 ? current + 1 : 0;
  return null;
}

function isDropKey(key: string): boolean {
  return key === 'ArrowDown' || key === 'Enter' || key === ' ';
}

function isResetKey(key: string): boolean {
  return key === 'r' || key === 'R';
}

export function useConnectFourKeyboard({
  onDrop,
  onResetRound,
  isEnabled = true,
}: UseConnectFourKeyboardOptions) {
  const [focusedColumn, setFocusedColumn] = useState<number>(3);

  useEffect(() => {
    if (!isEnabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingInInput(e.target)) return;

      const numCol = getNumberKeyColumn(e.key);
      if (numCol !== null) {
        e.preventDefault();
        setFocusedColumn(numCol);
        onDrop(numCol);
        return;
      }

      const nextCol = getNextArrowColumn(focusedColumn, e.key);
      if (nextCol !== null) {
        e.preventDefault();
        setFocusedColumn(nextCol);
        return;
      }

      if (isDropKey(e.key)) {
        e.preventDefault();
        onDrop(focusedColumn);
        return;
      }

      if (isResetKey(e.key)) {
        e.preventDefault();
        onResetRound();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, focusedColumn, onDrop, onResetRound]);

  return {
    focusedColumn,
    setFocusedColumn,
  };
}
