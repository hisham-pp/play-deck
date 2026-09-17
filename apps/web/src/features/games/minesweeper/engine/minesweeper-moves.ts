import type { MinesweeperCell, MinesweeperState } from '../types/minesweeper.types';
import { getNeighbors, toRowCol } from './minesweeper-board';
import { STATUS_LOST, STATUS_PLAYING, STATUS_WON } from './minesweeper-constants';
import { placeMinesWithFirstClickSafety } from './minesweeper-generator';

export function handleCellLoss(
  state: MinesweeperState,
  triggeredIndex: number,
  cells: MinesweeperCell[],
): MinesweeperState {
  const nextCells = cells.map((cell, idx) => {
    if (idx === triggeredIndex) {
      return { ...cell, isRevealed: true, isTriggeredMine: true };
    }
    if (cell.isMine && !cell.isFlagged) {
      return { ...cell, isRevealed: true };
    }
    if (!cell.isMine && cell.isFlagged) {
      return { ...cell, isFalseFlag: true };
    }
    return cell;
  });

  return {
    ...state,
    cells: nextCells,
    status: STATUS_LOST,
  };
}

export interface RevealResult {
  cells: MinesweeperCell[];
  newlyRevealed: number;
}

export function floodFillReveal(
  startIndex: number,
  sourceCells: readonly MinesweeperCell[],
  rows: number,
  cols: number,
): RevealResult {
  const cells = sourceCells.map((c) => ({ ...c }));
  const queue: number[] = [startIndex];
  let newlyRevealed = 0;

  cells[startIndex].isRevealed = true;
  newlyRevealed++;

  if (cells[startIndex].adjacentMines > 0) {
    return { cells, newlyRevealed };
  }

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = getNeighbors(curr, rows, cols);

    for (const nIndex of neighbors) {
      const neighbor = cells[nIndex];
      if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
        neighbor.isRevealed = true;
        newlyRevealed++;
        if (neighbor.adjacentMines === 0) {
          queue.push(nIndex);
        }
      }
    }
  }

  return { cells, newlyRevealed };
}

export function checkWinCondition(state: MinesweeperState, revealedCount: number): boolean {
  const totalSafeCells = state.rows * state.cols - state.mines;
  return revealedCount >= totalSafeCells;
}

export function applyWinState(state: MinesweeperState, cells: MinesweeperCell[]): MinesweeperState {
  const finalCells = cells.map((c) => (c.isMine ? { ...c, isFlagged: true } : c));
  return {
    ...state,
    cells: finalCells,
    status: STATUS_WON,
    revealedCount: state.rows * state.cols - state.mines,
    flagCount: state.mines,
  };
}

export function handleReveal(
  state: MinesweeperState,
  index: number,
  random: () => number,
): MinesweeperState {
  if (state.status === STATUS_WON || state.status === STATUS_LOST) {
    return state;
  }

  const target = state.cells[index];
  if (target.isRevealed || target.isFlagged) {
    return state;
  }

  let activeCells = state.cells;
  let isFirst = state.firstClick;

  if (isFirst) {
    activeCells = placeMinesWithFirstClickSafety(
      state.rows,
      state.cols,
      state.mines,
      index,
      random,
    );
    isFirst = false;
  }

  const resolvedTarget = activeCells[index];
  if (resolvedTarget.isMine) {
    return handleCellLoss(state, index, activeCells);
  }

  const { cells: updatedCells, newlyRevealed } = floodFillReveal(
    index,
    activeCells,
    state.rows,
    state.cols,
  );

  const nextRevealedCount = state.revealedCount + newlyRevealed;
  const isWon = checkWinCondition(state, nextRevealedCount);

  const baseNext: MinesweeperState = {
    ...state,
    cells: updatedCells,
    revealedCount: nextRevealedCount,
    status: isWon ? STATUS_WON : STATUS_PLAYING,
    firstClick: isFirst,
    startedAt: state.startedAt ?? Date.now(),
  };

  return isWon ? applyWinState(baseNext, updatedCells) : baseNext;
}

export function handleToggleFlag(state: MinesweeperState, index: number): MinesweeperState {
  if (state.status === STATUS_WON || state.status === STATUS_LOST) {
    return state;
  }

  const target = state.cells[index];
  if (target.isRevealed) {
    return state;
  }

  const nextFlagged = !target.isFlagged;
  const nextCells = state.cells.map((cell, idx) =>
    idx === index ? { ...cell, isFlagged: nextFlagged } : cell,
  );

  return {
    ...state,
    cells: nextCells,
    flagCount: nextFlagged ? state.flagCount + 1 : state.flagCount - 1,
    selectedCellIndex: index,
  };
}

export function handleChord(state: MinesweeperState, index: number): MinesweeperState {
  if (state.status !== STATUS_PLAYING) {
    return state;
  }

  const cell = state.cells[index];
  if (!cell.isRevealed || cell.adjacentMines === 0) {
    return state;
  }

  const neighbors = getNeighbors(index, state.rows, state.cols);
  let adjacentFlagCount = 0;
  for (const n of neighbors) {
    if (state.cells[n].isFlagged) {
      adjacentFlagCount++;
    }
  }

  if (adjacentFlagCount !== cell.adjacentMines) {
    return state;
  }

  // Check if any flagged neighbor is wrong (detonates a mine)
  for (const n of neighbors) {
    const neighbor = state.cells[n];
    if (!neighbor.isRevealed && !neighbor.isFlagged && neighbor.isMine) {
      return handleCellLoss(state, n, state.cells);
    }
  }

  // Safe to reveal unflagged neighbors
  let currentCells = state.cells;
  let totalAddedReveals = 0;

  for (const n of neighbors) {
    const neighbor = currentCells[n];
    if (!neighbor.isRevealed && !neighbor.isFlagged) {
      const { cells: nextCells, newlyRevealed } = floodFillReveal(
        n,
        currentCells,
        state.rows,
        state.cols,
      );
      currentCells = nextCells;
      totalAddedReveals += newlyRevealed;
    }
  }

  if (totalAddedReveals === 0) {
    return state;
  }

  const nextRevealedCount = state.revealedCount + totalAddedReveals;
  const isWon = checkWinCondition(state, nextRevealedCount);

  const baseNext: MinesweeperState = {
    ...state,
    cells: currentCells,
    revealedCount: nextRevealedCount,
    status: isWon ? STATUS_WON : STATUS_PLAYING,
  };

  return isWon ? applyWinState(baseNext, currentCells) : baseNext;
}

export function handleMoveSelection(
  state: MinesweeperState,
  rowDelta: number,
  colDelta: number,
): MinesweeperState {
  const { row, col } = toRowCol(state.selectedCellIndex, state.cols);
  const nextRow = Math.max(0, Math.min(state.rows - 1, row + rowDelta));
  const nextCol = Math.max(0, Math.min(state.cols - 1, col + colDelta));
  const nextIndex = nextRow * state.cols + nextCol;

  if (nextIndex === state.selectedCellIndex) {
    return state;
  }

  return { ...state, selectedCellIndex: nextIndex };
}
