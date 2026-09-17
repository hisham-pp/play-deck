import { useEffect, useState } from 'react';
import { GRID_CONFIGS } from '../engine/runic-memory-constants';
import type { DifficultyLevel } from '../types/runic-memory.types';

interface UseRunicKeyboardProps {
  difficulty: DifficultyLevel;
  isEnabled: boolean;
  onFlip: (index: number) => void;
  onReset: () => void;
}

export function useRunicKeyboard({
  difficulty,
  isEnabled,
  onFlip,
  onReset,
}: UseRunicKeyboardProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const config = GRID_CONFIGS[difficulty] || GRID_CONFIGS.apprentice;
  const { columns, totalCards } = config;

  useEffect(() => {
    if (focusedIndex >= totalCards) {
      setFocusedIndex(0);
    }
  }, [totalCards, focusedIndex]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in chat or input fields
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % totalCards);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + totalCards) % totalCards);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + columns) % totalCards);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - columns + totalCards) % totalCards);
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          onFlip(focusedIndex);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onReset();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, totalCards, columns, focusedIndex, onFlip, onReset]);

  return { focusedIndex, setFocusedIndex };
}
