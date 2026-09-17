'use client';

import { useEffect } from 'react';
import {
  DIFFICULTY_BEGINNER,
  DIFFICULTY_EXPERT,
  DIFFICULTY_INTERMEDIATE,
} from '../engine/minesweeper-constants';
import type { MinesweeperState } from '../types/minesweeper.types';
import type { MinesweeperControls } from './use-minesweeper-engine';

interface UseMinesweeperKeyboardOptions {
  state: MinesweeperState;
  controls: MinesweeperControls;
  enabled?: boolean;
}

export function useMinesweeperKeyboard({
  state,
  controls,
  enabled = true,
}: UseMinesweeperKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keyboard shortcuts if user is inside an input/textarea
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          controls.moveSelection(-1, 0);
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          controls.moveSelection(1, 0);
          break;

        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          controls.moveSelection(0, -1);
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          controls.moveSelection(0, 1);
          break;

        case ' ':
        case 'Enter': {
          e.preventDefault();
          const currCell = state.cells[state.selectedCellIndex];
          if (currCell && currCell.isRevealed && currCell.adjacentMines > 0) {
            controls.chordCell(state.selectedCellIndex);
          } else {
            controls.revealCell(state.selectedCellIndex);
          }
          break;
        }

        case 'f':
        case 'F':
          e.preventDefault();
          controls.toggleFlag(state.selectedCellIndex);
          break;

        case 'c':
        case 'C':
          e.preventDefault();
          controls.chordCell(state.selectedCellIndex);
          break;

        case 'r':
        case 'R':
          e.preventDefault();
          controls.resetGame();
          break;

        case '1':
          e.preventDefault();
          controls.newGame(DIFFICULTY_BEGINNER);
          break;

        case '2':
          e.preventDefault();
          controls.newGame(DIFFICULTY_INTERMEDIATE);
          break;

        case '3':
          e.preventDefault();
          controls.newGame(DIFFICULTY_EXPERT);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, controls, state.cells, state.selectedCellIndex]);
}
