import type { SudokuCellState, SudokuEventType, SudokuState } from '../types/sudoku.types';
import { EMPTY_CELL, STATUS_COMPLETED, STATUS_FAILED } from './sudoku-constants';
import { PEERS } from './sudoku-grid';
import {
  computeCandidates,
  findConflicts,
  findErrors,
  isSolved,
  toValues,
} from './sudoku-validator';

const MAX_HISTORY = 200;

function nextEvent(state: SudokuState, type: SudokuEventType, index: number, digit: number) {
  return { id: (state.lastEvent?.id ?? 0) + 1, type, index, digit };
}

function pushHistory(state: SudokuState, index: number): SudokuState['history'] {
  const entry = { index, previous: state.cells[index] };
  const history = [...state.history, entry];
  return history.length > MAX_HISTORY ? history.slice(history.length - MAX_HISTORY) : history;
}

/**
 * Recomputes every derived field after a board mutation and promotes the run to
 * completed when the grid is solved. Placement rules live here so no caller can
 * forget to refresh conflicts.
 */
function commit(
  state: SudokuState,
  cells: SudokuCellState[],
  event: SudokuState['lastEvent'],
  extra: Partial<SudokuState> = {},
): SudokuState {
  const values = toValues(cells);
  const next: SudokuState = {
    ...state,
    ...extra,
    cells,
    conflicts: findConflicts(values),
    errors: findErrors(values, state.puzzle.solution),
    lastEvent: event,
  };

  if (next.status !== STATUS_FAILED && isSolved(values)) {
    const isNewBestTime = next.bestTimeMs === null || next.elapsedMs < next.bestTimeMs;
    return {
      ...next,
      status: STATUS_COMPLETED,
      selectedIndex: next.selectedIndex,
      isNewBestTime,
      bestTimeMs: isNewBestTime ? next.elapsedMs : next.bestTimeMs,
      lastEvent: nextEvent(next, 'completed', next.selectedIndex, EMPTY_CELL),
    };
  }

  return next;
}

function replaceCell(
  cells: SudokuCellState[],
  index: number,
  patch: Partial<SudokuCellState>,
): SudokuCellState[] {
  const next = cells.slice();
  next[index] = { ...next[index], ...patch };
  return next;
}

/** Placing a digit retires that pencil mark from every peer. */
function prunePeerCandidates(cells: SudokuCellState[], index: number, digit: number) {
  const next = cells.slice();
  for (const peer of PEERS[index]) {
    const cell = next[peer];
    if (cell.value !== EMPTY_CELL || !cell.candidates.includes(digit)) continue;
    next[peer] = { ...cell, candidates: cell.candidates.filter((c) => c !== digit) };
  }
  return next;
}

export function applyDigit(state: SudokuState, digit: number): SudokuState {
  const index = state.selectedIndex;
  const cell = state.cells[index];
  if (cell.given) return { ...state, lastEvent: nextEvent(state, 'locked', index, digit) };
  if (cell.value === digit) return applyClear(state);

  const history = pushHistory(state, index);
  let cells = replaceCell(state.cells, index, { value: digit, candidates: [] });
  cells = prunePeerCandidates(cells, index, digit);

  const isMistake = state.puzzle.solution[index] !== digit;
  const mistakes = isMistake ? state.mistakes + 1 : state.mistakes;
  const hasFailed = isMistake && mistakes >= state.maxMistakes;

  const event = nextEvent(state, isMistake ? 'mistake' : 'placed', index, digit);
  const committed = commit(state, cells, event, { history, mistakes });

  if (!hasFailed) return committed;
  return {
    ...committed,
    status: STATUS_FAILED,
    lastEvent: nextEvent(committed, 'failed', index, digit),
  };
}

export function applyCandidate(state: SudokuState, digit: number): SudokuState {
  const index = state.selectedIndex;
  const cell = state.cells[index];
  if (cell.given || cell.value !== EMPTY_CELL) {
    return { ...state, lastEvent: nextEvent(state, 'locked', index, digit) };
  }

  const candidates = cell.candidates.includes(digit)
    ? cell.candidates.filter((c) => c !== digit)
    : [...cell.candidates, digit].sort((a, b) => a - b);

  return commit(
    state,
    replaceCell(state.cells, index, { candidates }),
    nextEvent(state, 'note', index, digit),
    {
      history: pushHistory(state, index),
    },
  );
}

export function applyClear(state: SudokuState): SudokuState {
  const index = state.selectedIndex;
  const cell = state.cells[index];
  if (cell.given) return { ...state, lastEvent: nextEvent(state, 'locked', index, EMPTY_CELL) };
  if (cell.value === EMPTY_CELL && cell.candidates.length === 0) return state;

  return commit(
    state,
    replaceCell(state.cells, index, { value: EMPTY_CELL, candidates: [] }),
    nextEvent(state, 'cleared', index, EMPTY_CELL),
    { history: pushHistory(state, index) },
  );
}

/** Reveals the solution digit for the selected cell, or the first empty one. */
export function applyHint(state: SudokuState): SudokuState {
  if (state.hintsRemaining <= 0) return state;

  const selected = state.cells[state.selectedIndex];
  const index =
    selected.value === EMPTY_CELL && !selected.given
      ? state.selectedIndex
      : state.cells.findIndex((cell) => cell.value === EMPTY_CELL);
  if (index === -1) return state;

  const digit = state.puzzle.solution[index];
  const history = pushHistory({ ...state, selectedIndex: index }, index);
  let cells = replaceCell(state.cells, index, { value: digit, candidates: [] });
  cells = prunePeerCandidates(cells, index, digit);

  return commit(state, cells, nextEvent(state, 'hint', index, digit), {
    history,
    hintsRemaining: state.hintsRemaining - 1,
    selectedIndex: index,
  });
}

export function applyUndo(state: SudokuState): SudokuState {
  const last = state.history[state.history.length - 1];
  if (!last) return state;

  const cells = state.cells.slice();
  cells[last.index] = last.previous;

  return commit(state, cells, nextEvent(state, 'undo', last.index, last.previous.value), {
    history: state.history.slice(0, -1),
    selectedIndex: last.index,
  });
}

/** Fills every empty cell's pencil marks with the digits still legal there. */
export function applyAutoCandidates(state: SudokuState): SudokuState {
  const values = toValues(state.cells);
  const cells = state.cells.map((cell, index) =>
    cell.value === EMPTY_CELL ? { ...cell, candidates: computeCandidates(values, index) } : cell,
  );

  return commit(state, cells, nextEvent(state, 'note', state.selectedIndex, EMPTY_CELL));
}
