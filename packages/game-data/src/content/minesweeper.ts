import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameControlKeys } from '../enums/controls.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const minesweeperGame = defineGameModule({
  id: 'minesweeper',
  description:
    'The definitive deduction classic. Clear hidden minefields with first-click safety, tactical chording, customizable boards, and record-tracking speedruns.',
  category: GameCategories.P,
  players: getPCount(1),
  releaseDate: GameReleaseDates.D_2026_09_17,
  tags: [GameTags.PZ, GameTags.LOG, GameTags.S, GameTags.C, GameTags.SR, GameTags.KEYBOARD_READY],
  seo: {
    title: 'Play Minesweeper Online Free — Beginner to Expert',
    description:
      'Play classic Minesweeper free in your browser. First-click safety, chording, custom boards and beginner, intermediate and expert presets with saved best times.',
    keywords: [
      'minesweeper online',
      'free minesweeper',
      'minesweeper expert',
      'minesweeper no download',
      'classic minesweeper game',
      'minesweeper chording',
    ],
  },
  tagline: 'The definitive deduction classic, with first-click safety and full chording support.',
  overview: [
    'Minesweeper hides a fixed number of mines under a grid of covered cells. Uncover a safe cell and it shows how many mines touch it; uncover a mine and the run is over. Everything between those two outcomes is deduction — reading the numbers, flagging what must be a mine, and clearing what cannot be.',
    'This build sticks to the rules speedrunners expect. Your first click is always safe and always opens a region, chording lets you clear a satisfied number in one action, and the three classic presets — beginner, intermediate and expert — sit alongside custom board sizes. Best times are recorded per preset in your browser.',
  ],
  howToPlay: [
    {
      title: 'Open anywhere',
      description:
        'The first cell you reveal is guaranteed safe and expands into an open region, giving you numbers to work from.',
    },
    {
      title: 'Read the numbers',
      description:
        'A revealed number tells you exactly how many of that cell’s eight neighbours are mines.',
    },
    {
      title: 'Flag the certainties',
      description:
        'When a number already touches exactly as many covered cells as its value, every one of them is a mine. Flag them.',
    },
    {
      title: 'Chord to go faster',
      description:
        'Once a number has all its mines flagged, chord it to clear every remaining neighbour in a single action.',
    },
    {
      title: 'Clear the board',
      description:
        'Reveal every safe cell to win. You do not need to flag every mine — only to uncover everything that is not one.',
    },
  ],
  rules: [
    {
      title: 'Numbers count neighbours',
      description:
        'Each revealed number is the count of mines in the eight cells surrounding it, diagonals included.',
    },
    {
      title: 'First click is safe',
      description:
        'Mines are placed after your opening click, so you can never lose on the first move.',
    },
    {
      title: 'Flags are markers, not moves',
      description:
        'Flagging a cell only prevents you from revealing it by accident. Flags do not need to be correct to win.',
    },
    {
      title: 'Chording needs a satisfied number',
      description:
        'A chord only fires when the flags around a number match its value. Mis-flag and the chord will detonate a mine.',
    },
    {
      title: 'Win by full clearance',
      description: 'The board is won when every cell that is not a mine has been revealed.',
    },
  ],
  controls: [
    {
      key: 'Left click / tap',
      action: 'Reveal cell',
    },
    {
      key: 'Right click / long press',
      action: 'Toggle flag',
    },
    {
      key: GameControlKeys.WASD_ARROWS,
      action: 'Move selection',
    },
    {
      key: GameControlKeys.SPACE_ENTER,
      action: 'Reveal selected cell',
    },
    {
      key: GameControlKeys.KEY_F,
      action: 'Flag selected cell',
    },
    {
      key: GameControlKeys.KEY_C,
      action: 'Chord selected cell',
    },
    {
      key: GameControlKeys.R_RESTART,
      action: 'Restart board',
    },
    {
      key: '1 / 2 / 3',
      action: 'New beginner / intermediate / expert board',
    },
  ],
  tips: [
    'Work the edges and corners first. They have fewer neighbours, so their numbers constrain far fewer unknowns.',
    'Learn the 1-2-1 pattern along a wall: the cells under the 1s are safe and the cell under the 2 is a mine, every time.',
    'Count the covered neighbours before you flag. If a 3 touches exactly three covered cells, all three are mines regardless of what else is on the board.',
    'Chord relentlessly once you are confident. It is the single biggest time saver on expert boards.',
    'Late in a board, use the remaining mine counter. Global counting resolves endgame positions that local numbers cannot.',
  ],
  faq: [
    {
      question: 'Can I lose on the first click?',
      answer:
        'No. Mines are placed after your first reveal, so the opening click is always safe and always opens a region.',
    },
    {
      question: 'What is chording?',
      answer:
        'Chording clears every remaining covered neighbour of a number once that number has the right count of flags around it. It is the fastest way to open a board.',
    },
    {
      question: 'What board sizes are available?',
      answer:
        'The three classic presets — beginner, intermediate and expert — plus custom boards where you set the dimensions and mine count.',
    },
    {
      question: 'Are my best times recorded?',
      answer:
        'Yes. A personal best is kept for each preset, stored locally in your browser on that device.',
    },
  ],
});

export const minesweeperContent = minesweeperGame.content;
export const minesweeperDefinition = minesweeperGame.definition;
