import { GameDefinition } from '@playdeck/game-types';

const STATUS_COMING_SOON = 'coming-soon';
const BADGE_COMING_SOON = 'Coming Soon';

export const GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: 'snake',
    name: 'Snake',
    slug: 'snake',
    description:
      'Guide the snake, eat energy pellets, and grow without crashing into walls or your own tail.',
    category: 'arcade',
    players: { min: 1, max: 1 },
    status: 'available',
    thumbnailUrl: '/games/snake/icon.svg',
    tags: ['Arcade', 'Classic', 'Retro', 'High Score'],
    featured: true,
    badge: 'Ready to Play',
    releaseDate: '2026-09-11',
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    slug: 'tic-tac-toe',
    description:
      'The classic two-player grid battle. Align three marks horizontally, vertically, or diagonally before your opponent.',
    category: 'strategy',
    players: { min: 1, max: 2 },
    status: 'available',
    thumbnailUrl: '/games/tic-tac-toe/icon.svg',
    tags: ['Classic', 'Turn-based', 'Quick Play', 'Local Play', 'AI Opponent'],
    featured: true,
    badge: 'Ready to Play',
    releaseDate: '2026-09-12',
  },
  {
    id: 'pen-fight',
    name: 'Pen Fight',
    slug: 'pen-fight',
    description:
      'The classic desktop duel, remade in 3D. Flick your pen to knock your rival off the arena table before they knock you off first.',
    category: 'arcade',
    players: { min: 1, max: 2 },
    status: 'available',
    thumbnailUrl: '/games/pen-fight/icon.svg',
    tags: ['3D', 'Physics', 'Local Play', 'AI Opponent', 'Nostalgia'],
    featured: true,
    badge: 'Ready to Play',
    releaseDate: '2026-09-12',
  },
  {
    id: 'chess',
    name: 'Master Chess',
    slug: 'master-chess',
    description:
      'The timeless game of kings, pawns, and strategic mastery. Outthink your opponent and deliver checkmate.',
    category: 'board',
    players: { min: 2, max: 2 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/chess/icon.svg',
    tags: ['Grandmaster', 'Tactics', 'Board', 'Multiplayer Ready'],
    featured: true,
    badge: BADGE_COMING_SOON,
    releaseDate: 'Q4 2026',
  },
  {
    id: 'connect-four',
    name: 'Connect Grid',
    slug: 'connect-grid',
    description:
      'A vertical drop duel. Align four consecutive discs while blocking counterattacks from your adversary.',
    category: 'puzzle',
    players: { min: 1, max: 2 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/connect-four/icon.svg',
    tags: ['Casual', 'Strategy', 'Tabletop'],
    badge: BADGE_COMING_SOON,
    releaseDate: 'Q1 2027',
  },
  {
    id: 'runic-memory',
    name: 'Runic Memory',
    slug: 'runic-memory',
    description:
      'Test your cognitive recall across ancient glowing sigils. Flip pairs to clear the board in minimum turns.',
    category: 'puzzle',
    players: { min: 1, max: 2 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/runic-memory/icon.svg',
    tags: ['Brain Training', 'Memory', 'Solitaire', 'Relaxing'],
    badge: BADGE_COMING_SOON,
    releaseDate: 'Q1 2027',
  },
];
