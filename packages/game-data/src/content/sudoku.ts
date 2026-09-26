import { defineGameModule } from '../core/base-game';
import { GameCategories, GameControlKeys, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const sudokuGame = defineGameModule({
  id: 'sudoku',
  description:
    'Seven difficulty levels of freshly generated grids, each with exactly one solution. Pencil marks, conflict highlighting, mistake budgets and per-level best times.',
  category: GameCategories.P,
  players: getPCount(1),
  releaseDate: GameReleaseDates.D_2026_09_13,
  tags: [GameTags.PZ, GameTags.LOG, GameTags.S, GameTags.BRAIN_TRAINING, GameTags.LEVELS_7],
  seo: {
    title: 'Play Sudoku Online Free — 7 Difficulty Levels',
    description:
      'Play free Sudoku in your browser across seven difficulty levels. Freshly generated grids with one guaranteed solution, pencil marks, hints and best times.',
    keywords: [
      'sudoku online',
      'free sudoku',
      'sudoku easy to expert',
      'daily sudoku puzzle',
      'sudoku with pencil marks',
      'sudoku no download',
    ],
  },
  tagline: 'Seven difficulty tiers of freshly generated grids, each with exactly one solution.',
  overview: [
    'Sudoku is a pure logic puzzle: fill a nine-by-nine grid so every row, every column and every three-by-three box contains the digits 1 through 9 exactly once. No arithmetic and no guessing are required — every puzzle here is generated with a uniqueness check, so there is always exactly one solution and always a logical path to it.',
    'Seven difficulty levels run from a gentle warm-up to grids that demand advanced chains. Pencil marks let you record candidates, conflict highlighting flags a contradiction the moment you create one, a mistake budget keeps the pressure on, and your best time per level is stored locally so you can race yourself.',
  ],
  howToPlay: [
    {
      title: 'Choose a difficulty',
      description:
        'Pick one of the seven levels. A fresh grid is generated for every run, so you never replay the same puzzle.',
    },
    {
      title: 'Select a cell',
      description:
        'Click a square, or move the selection with the arrow keys or WASD for full keyboard play.',
    },
    {
      title: 'Place a digit',
      description:
        'Type 1 through 9 to enter a value. Hold Shift while typing a digit to leave a pencil mark instead.',
    },
    {
      title: 'Narrow the candidates',
      description:
        'Use pencil marks to track what can still go in each cell, then eliminate until only one option survives.',
    },
    {
      title: 'Finish clean',
      description:
        'Complete every row, column and box without exhausting your mistake budget to bank a time for that level.',
    },
  ],
  rules: [
    {
      title: 'One of each per row',
      description: 'Every horizontal row must contain the digits 1 to 9 with no repeats.',
    },
    {
      title: 'One of each per column',
      description: 'Every vertical column must contain the digits 1 to 9 with no repeats.',
    },
    {
      title: 'One of each per box',
      description: 'Each of the nine 3x3 boxes must contain the digits 1 to 9 with no repeats.',
    },
    {
      title: 'Exactly one solution',
      description:
        'Every generated grid is verified to have a single solution, so the puzzle is always solvable by logic alone.',
    },
    {
      title: 'Mistake budget',
      description:
        'Placing a digit that contradicts the solution costs you one of a limited number of mistakes for the run.',
    },
  ],
  controls: [
    {
      key: GameControlKeys.WASD_ARROWS,
      action: 'Move selection',
    },
    {
      key: GameControlKeys.DIGITS_1_9,
      action: 'Place digit',
    },
    {
      key: 'Shift + 1 – 9',
      action: 'Toggle pencil mark',
    },
    {
      key: '0 / Backspace',
      action: 'Clear cell',
    },
    {
      key: 'N / Space',
      action: 'Toggle note mode',
    },
    {
      key: 'U / Ctrl+Z',
      action: 'Undo',
    },
    {
      key: 'H',
      action: 'Reveal a hint',
    },
    {
      key: GameControlKeys.PAUSE,
      action: 'Pause / resume',
    },
    {
      key: GameControlKeys.R_RESTART,
      action: 'Restart puzzle',
    },
  ],
  tips: [
    'Scan for naked singles first — a cell where only one digit can legally fit. Easy grids are often solved entirely this way.',
    'Then look for hidden singles: a digit that can only go in one cell of a given row, column or box, even if that cell has other candidates.',
    'On harder grids, hunt naked pairs. Two cells in a unit sharing the same two candidates strip those digits from every other cell in that unit.',
    'Use pencil marks consistently or not at all. Half-filled candidate lists mislead you more often than an empty grid does.',
    'If you are ever guessing, back up. Every puzzle here is solvable by deduction, so a guess means you missed an elimination.',
  ],
  faq: [
    {
      question: 'Are the Sudoku puzzles randomly generated?',
      answer:
        'Yes. Every run generates a fresh grid, and each one is verified to have exactly one valid solution.',
    },
    {
      question: 'How many difficulty levels are there?',
      answer:
        'Seven, ranging from a gentle introduction to grids that require advanced elimination techniques.',
    },
    {
      question: 'Can I use pencil marks?',
      answer:
        'Yes. Toggle note mode with N, or hold Shift while typing a digit to place a single candidate mark.',
    },
    {
      question: 'Are my best times saved?',
      answer:
        'Yes. A personal best is kept per difficulty level, stored locally in your browser on that device.',
    },
  ],
});

export const sudokuContent = sudokuGame.content;
export const sudokuDefinition = sudokuGame.definition;
