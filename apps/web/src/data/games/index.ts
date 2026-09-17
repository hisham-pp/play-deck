import { GameDefinition } from '@playdeck/game-types';

const STATUS_AVAILABLE = 'available';
const BADGE_READY_TO_PLAY = 'Ready to Play';
const RELEASE_DATE_2026_09_12 = '2026-09-12';
const TAG_CLASSIC = 'Classic';
const TAG_LOCAL_PLAY = 'Local Play';
const CATEGORY_PUZZLE = 'puzzle';

export const GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: 'snake',
    name: 'Snake',
    slug: 'snake',
    description:
      'Guide the snake, eat energy pellets, and grow without crashing into walls or your own tail.',
    category: 'arcade',
    players: { min: 1, max: 1 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/snake/icon.svg',
    tags: ['Arcade', TAG_CLASSIC, 'Retro', 'High Score'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-11',
  },
  {
    id: 'tetris',
    name: 'Tetris',
    slug: 'tetris',
    description:
      'Rotate and stack falling tetrominoes to clear lines before the board overflows. Speed ramps up with every level.',
    category: CATEGORY_PUZZLE,
    players: { min: 1, max: 1 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/tetris/icon.svg',
    tags: ['Arcade', TAG_CLASSIC, 'Puzzle', 'High Score'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: RELEASE_DATE_2026_09_12,
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    slug: 'tic-tac-toe',
    description:
      'The classic two-player grid battle. Align three marks horizontally, vertically, or diagonally before your opponent.',
    category: 'strategy',
    players: { min: 1, max: 2 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/tic-tac-toe/icon.svg',
    tags: [TAG_CLASSIC, 'Turn-based', 'Quick Play', TAG_LOCAL_PLAY, 'AI Opponent'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: RELEASE_DATE_2026_09_12,
  },
  {
    id: 'pen-fight',
    name: 'Pen Fight',
    slug: 'pen-fight',
    description:
      'The classic desktop duel, remade in 3D. Flick your pen to knock your rival off the arena table before they knock you off first.',
    category: 'arcade',
    players: { min: 1, max: 2 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/pen-fight/icon.svg',
    tags: ['3D', 'Physics', TAG_LOCAL_PLAY, 'AI Opponent', 'Nostalgia'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: RELEASE_DATE_2026_09_12,
  },
  {
    id: 'ludo',
    name: 'Ludo',
    slug: 'ludo',
    description:
      'Classic board race for 2 to 6 players featuring 3D physics dice, AI bot personalities, and custom rule configurations.',
    category: 'board',
    players: { min: 2, max: 6 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/ludo/icon.svg',
    tags: ['Board', 'Dice', '3D', 'Physics', '2-6 Players', 'Bots'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: RELEASE_DATE_2026_09_12,
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    slug: 'sudoku',
    description:
      'Seven difficulty levels of freshly generated grids, each with exactly one solution. Pencil marks, conflict highlighting, mistake budgets and per-level best times.',
    category: CATEGORY_PUZZLE,
    players: { min: 1, max: 1 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/sudoku/icon.svg',
    tags: ['Puzzle', 'Logic', 'Solo', 'Brain Training', '7 Levels'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-13',
  },
  {
    id: 'chess',
    name: 'Master Chess',
    slug: 'master-chess',
    description:
      'Full tournament rules on a 3D board: castling, en passant, promotion, check, stalemate and every draw. Pass and play, or challenge a friend online with voice and chat.',
    category: 'board',
    players: { min: 2, max: 2 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/chess/icon.svg',
    tags: ['Grandmaster', 'Board', '3D', TAG_LOCAL_PLAY, 'Online 1v1', 'Voice Chat'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-13',
  },
  {
    id: 'connect-four',
    name: 'Connect Four',
    slug: 'connect-four',
    description:
      'A vertical gravity duel. Drop discs to align four in a row horizontally, vertically, or diagonally before your opponent.',
    category: 'strategy',

    players: { min: 1, max: 2 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/connect-four/icon.svg',
    tags: [TAG_CLASSIC, 'Strategy', 'Gravity Grid', TAG_LOCAL_PLAY, 'AI Opponent'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-13',
  },
  {
    id: 'runic-memory',
    name: 'Runic Memory',
    slug: 'runic-memory',
    description:
      'Test your cognitive recall across ancient glowing sigils. Flip pairs to clear the board in minimum turns.',
    category: CATEGORY_PUZZLE,
    players: { min: 1, max: 2 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/runic-memory/icon.svg',
    tags: ['Brain Training', 'Memory', 'Solitaire', 'Multiplayer Ready', 'Voice Chat', 'Arcane'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-17',
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    slug: 'minesweeper',
    description:
      'The definitive deduction classic. Clear hidden minefields with first-click safety, tactical chording, customizable boards, and record-tracking speedruns.',
    category: CATEGORY_PUZZLE,
    players: { min: 1, max: 1 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/minesweeper/icon.svg',
    tags: ['Puzzle', 'Logic', 'Solo', TAG_CLASSIC, 'Speedrun', 'Keyboard Ready'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-17',
  },
];
