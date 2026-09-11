import { GameDefinition } from '@playdeck/game-types';

const STATUS_COMING_SOON = 'coming-soon';
const BADGE_COMING_SOON = 'Coming Soon';

export const GAME_DEFINITIONS: GameDefinition[] = [
  {
    id: 'tic-tac-toe',
    name: 'Tic-Tac-Toe',
    slug: 'tic-tac-toe',
    description:
      'The classic two-player grid battle. Align three marks horizontally, vertically, or diagonally before your opponent.',
    category: 'strategy',
    players: { min: 1, max: 2 },
    status: 'available',
    tags: ['Classic', 'Turn-based', 'Quick Play', 'Local Play'],
    featured: true,
    badge: 'Ready to Play',
    releaseDate: '2026-09-01',
    createGame: () => ({
      board: Array(9).fill(null),
      currentTurn: 'X',
      moves: 0,
    }),
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
    tags: ['Grandmaster', 'Tactics', 'Board', 'Multiplayer Ready'],
    featured: true,
    badge: BADGE_COMING_SOON,
    releaseDate: 'Q4 2026',
  },
  {
    id: 'snake',
    name: 'Cyber Snake',
    slug: 'cyber-snake',
    description:
      'Navigate the neon serpent, harvest energy pellets, and survive ever-accelerating speeds without biting your tail.',
    category: 'arcade',
    players: { min: 1, max: 1 },
    status: STATUS_COMING_SOON,
    tags: ['Arcade', 'Reflexes', 'Retro', 'High Score'],
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
    tags: ['Brain Training', 'Memory', 'Solitaire', 'Relaxing'],
    badge: BADGE_COMING_SOON,
    releaseDate: 'Q1 2027',
  },
];
