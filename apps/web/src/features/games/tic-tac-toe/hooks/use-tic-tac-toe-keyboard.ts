import { useEffect, useState } from 'react';

interface UseTicTacToeKeyboardOptions {
  onMove: (index: number) => void;
  onResetRound: () => void;
  isEnabled?: boolean;
}

function isTypingInInput(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

function getNextArrowIndex(prev: number, key: string): number | null {
  switch (key) {
    case 'ArrowUp':
      return prev >= 3 ? prev - 3 : prev + 6;
    case 'ArrowDown':
      return prev <= 5 ? prev + 3 : prev - 6;
    case 'ArrowLeft': {
      const row = Math.floor(prev / 3);
      const col = ((prev % 3) - 1 + 3) % 3;
      return row * 3 + col;
    }
    case 'ArrowRight': {
      const row = Math.floor(prev / 3);
      const col = ((prev % 3) + 1) % 3;
      return row * 3 + col;
    }
    default:
      return null;
  }
}

function getNumberKeyIndex(key: string): number | null {
  if (/^[1-9]$/.test(key)) {
    return parseInt(key, 10) - 1;
  }
  return null;
}

export function useTicTacToeKeyboard({
  onMove,
  onResetRound,
  isEnabled = true,
}: UseTicTacToeKeyboardOptions) {
  const [focusedIndex, setFocusedIndex] = useState<number>(4);

  useEffect(() => {
    if (!isEnabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (isTypingInInput(e.target)) return;

      const numIndex = getNumberKeyIndex(e.key);
      if (numIndex !== null) {
        e.preventDefault();
        setFocusedIndex(numIndex);
        onMove(numIndex);
        return;
      }

      const arrowIndex = getNextArrowIndex(focusedIndex, e.key);
      if (arrowIndex !== null) {
        e.preventDefault();
        setFocusedIndex(arrowIndex);
        return;
      }

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onMove(focusedIndex);
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onResetRound();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEnabled, focusedIndex, onMove, onResetRound]);

  return {
    focusedIndex,
    setFocusedIndex,
  };
}
