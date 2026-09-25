import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createInitialCrosswordState,
  cycleCrosswordClue,
  deleteCrosswordLetter,
  getPuzzleCatalog,
  inputCrosswordLetter,
  navigateCrosswordCursor,
  selectCrosswordCell,
  selectCrosswordClue,
  startCrosswordGame,
  stepCrosswordEngine,
} from './crossword-clash-engine';

describe('Crossword Clash Engine', () => {
  it('validates that all 15 catalog puzzles have 100% letter intersection consistency', () => {
    const catalog = getPuzzleCatalog();
    assert.equal(catalog.length, 15);

    for (const puzzle of catalog) {
      const grid = Array.from({ length: puzzle.rows }, () => Array(puzzle.cols).fill('#'));

      for (const clue of puzzle.clues) {
        assert.ok(clue.answer.length >= 3, `${puzzle.id} ${clue.id} must be at least 3 chars`);
        assert.ok(clue.text.length > 5, `${puzzle.id} ${clue.id} must have description`);

        for (let i = 0; i < clue.answer.length; i++) {
          const r = clue.direction === 'across' ? clue.row : clue.row + i;
          const c = clue.direction === 'across' ? clue.col + i : clue.col;

          assert.ok(
            r >= 0 && r < puzzle.rows && c >= 0 && c < puzzle.cols,
            `${puzzle.id} ${clue.id} out of bounds at (${r},${c})`,
          );

          const expectedChar = clue.answer[i].toUpperCase();
          if (grid[r][c] !== '#') {
            assert.equal(
              grid[r][c],
              expectedChar,
              `${puzzle.id} conflict at (${r},${c}) between ${grid[r][c]} and ${expectedChar}`,
            );
          }
          grid[r][c] = expectedChar;
        }
      }
    }
  });

  it('creates initial game state with correct grid geometry and cell numbering', () => {
    const state = createInitialCrosswordState({
      theme: 'science',
      difficulty: 'easy',
      mode: 'solo',
    });

    assert.equal(state.status, 'lobby');
    assert.equal(state.rows, 4);
    assert.equal(state.cols, 4);
    assert.equal(state.players.length, 1);
    assert.ok(state.totalLettersToSolve > 0);
    assert.equal(state.solvedLettersCount, 0);

    // Cell at row 0, col 1 should have a number and solutionChar
    const cell01 = state.cells[0][1];
    assert.equal(cell01.isBlack, false);
    assert.equal(cell01.solutionChar, 'F');
    assert.equal(cell01.number, 1);

    // Corner cell at row 0, col 0 is black in Easy 4x4
    const cell00 = state.cells[0][0];
    assert.equal(cell00.isBlack, true);
  });

  it('transitions from lobby -> countdown -> playing via stepEngine', () => {
    let state = createInitialCrosswordState({ theme: 'science', difficulty: 'easy' });
    assert.equal(state.status, 'lobby');

    state = startCrosswordGame(state);
    assert.equal(state.status, 'countdown');
    assert.equal(state.countdownTimer, 3);

    state = stepCrosswordEngine(state, 1.5);
    assert.equal(state.status, 'countdown');
    assert.equal(state.countdownTimer, 1.5);

    state = stepCrosswordEngine(state, 2.0);
    assert.equal(state.status, 'playing');
    assert.equal(state.countdownTimer, 0);
  });

  it('handles cell selection and direction toggling', () => {
    let state = createInitialCrosswordState({ theme: 'science', difficulty: 'easy' });

    // Select row 1, col 1
    state = selectCrosswordCell(state, 1, 1);
    assert.equal(state.selectedRow, 1);
    assert.equal(state.selectedCol, 1);
    const initialDir = state.selectedDirection;

    // Clicking the same cell toggles direction
    state = selectCrosswordCell(state, 1, 1);
    assert.notEqual(state.selectedDirection, initialDir);
  });

  it('navigates and selects clues properly', () => {
    let state = createInitialCrosswordState({ theme: 'geography', difficulty: 'easy' });
    const targetClue = state.clues[1]; // 4A

    state = selectCrosswordClue(state, targetClue.id);
    assert.equal(state.selectedClueId, targetClue.id);
    assert.equal(state.selectedRow, targetClue.row);
    assert.equal(state.selectedCol, targetClue.col);

    // Cycling clue
    state = cycleCrosswordClue(state, 1);
    assert.notEqual(state.selectedClueId, targetClue.id);
  });

  it('navigates cursor and skips black cells', () => {
    let state = createInitialCrosswordState({ theme: 'science', difficulty: 'easy' });
    state = selectCrosswordCell(state, 0, 1);

    // Moving left from (0, 1) should not land on black cell (0, 0)
    const nextState = navigateCrosswordCursor(state, 'left');
    assert.equal(nextState.cells[nextState.selectedRow][nextState.selectedCol].isBlack, false);
  });

  it('locks correct letter, awards points, and gives word bounty on clue completion', () => {
    let state = createInitialCrosswordState({ theme: 'science', difficulty: 'easy', mode: 'solo' });
    state = startCrosswordGame(state);
    state = stepCrosswordEngine(state, 4.0); // Now playing
    assert.equal(state.status, 'playing');

    // Clue 1A is FIT at (0, 1), (0, 2), (0, 3)
    state = selectCrosswordClue(state, '1A');
    assert.equal(state.selectedRow, 0);
    assert.equal(state.selectedCol, 1);

    // Incorrect input
    state = inputCrosswordLetter(state, 'player-1', 'Z');
    assert.equal(state.cells[0][1].lockedChar, undefined);
    assert.equal(state.cells[0][1].isError, true);
    assert.equal(state.players[0].score, 0);

    // Correct input 'F'
    state = inputCrosswordLetter(state, 'player-1', 'F');
    assert.equal(state.cells[0][1].lockedChar, 'F');
    assert.equal(state.players[0].score, 10);
    assert.equal(state.players[0].lettersSolved, 1);

    // Cursor should automatically advance to col 2 ('I')
    assert.equal(state.selectedRow, 0);
    assert.equal(state.selectedCol, 2);

    // Input 'I'
    state = inputCrosswordLetter(state, 'player-1', 'I');
    assert.equal(state.cells[0][2].lockedChar, 'I');
    assert.equal(state.players[0].score, 20);

    // Input 'T' -> Completes 1A!
    state = inputCrosswordLetter(state, 'player-1', 'T');
    assert.equal(state.cells[0][3].lockedChar, 'T');

    // Score should be 10 (F) + 10 (I) + 10 (T) + 100 (Bonus for 1A) = 130!
    assert.equal(state.players[0].score, 130);
    assert.equal(state.players[0].wordsCompleted, 1);
    assert.equal(state.clues.find((c) => c.id === '1A')?.isCompleted, true);
  });

  it('prevents overwriting locked letters and advances cursor cleanly', () => {
    let state = createInitialCrosswordState({ theme: 'science', difficulty: 'easy', mode: 'solo' });
    state = startCrosswordGame(state);
    state = stepCrosswordEngine(state, 4.0);

    state = selectCrosswordCell(state, 0, 1);
    state = inputCrosswordLetter(state, 'player-1', 'F');
    assert.equal(state.cells[0][1].lockedChar, 'F');

    // Attempt to select (0, 1) and overwrite with 'X'
    state = selectCrosswordCell(state, 0, 1);
    state = inputCrosswordLetter(state, 'player-1', 'X');
    assert.equal(state.cells[0][1].lockedChar, 'F'); // unchanged
  });

  it('handles deletion of draft user characters and backspacing cursor', () => {
    let state = createInitialCrosswordState({ theme: 'science', difficulty: 'easy', mode: 'solo' });
    state = startCrosswordGame(state);
    state = stepCrosswordEngine(state, 4.0);

    state = selectCrosswordCell(state, 0, 1);
    state = inputCrosswordLetter(state, 'player-1', 'Q'); // wrong letter draft
    assert.equal(state.cells[0][1].userChar, 'Q');

    state = deleteCrosswordLetter(state);
    assert.equal(state.cells[0][1].userChar, '');
  });

  it('simulates bot actions in race mode during stepCrosswordEngine', () => {
    let state = createInitialCrosswordState({
      theme: 'geography',
      difficulty: 'easy',
      mode: 'race',
    });
    state = startCrosswordGame(state);
    state = stepCrosswordEngine(state, 4.0); // enters playing

    // Run engine steps to trigger bot cooldown
    for (let i = 0; i < 15; i++) {
      state = stepCrosswordEngine(state, 1.0);
    }

    // At least one bot should have scored or attempted a move
    const botScores = state.players.filter((p) => p.isBot).reduce((sum, p) => sum + p.score, 0);
    assert.ok(botScores > 0, 'Bots should solve letters over time in race mode');
  });

  it('completes the game when all cells are filled', () => {
    let state = createInitialCrosswordState({ theme: 'science', difficulty: 'easy', mode: 'solo' });
    state = startCrosswordGame(state);
    state = stepCrosswordEngine(state, 4.0);

    // Solve all cells directly
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        const cell = state.cells[r][c];
        if (!cell.isBlack && !cell.lockedChar) {
          state = selectCrosswordCell(state, r, c);
          state = inputCrosswordLetter(state, 'player-1', cell.solutionChar);
        }
      }
    }

    assert.equal(state.status, 'completed');
    assert.equal(state.solvedLettersCount, state.totalLettersToSolve);
  });
});
