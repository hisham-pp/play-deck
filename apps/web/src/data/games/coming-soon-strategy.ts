import type { GameDefinition } from '@playdeck/game-types';
import {
  STATUS_COMING_SOON,
  BADGE_COMING_SOON,
  RELEASE_DATE_COMING_SOON,
  TAG_MULTIPLAYER,
  TAG_VOICE_CHAT,
  TAG_PHYSICS,
  TAG_SOLO,
  CATEGORY_STRATEGY,
  CATEGORY_CARD,
  CATEGORY_BOARD,
} from './constants';

export const COMING_SOON_STRATEGY_GAMES: GameDefinition[] = [
  {
    id: 'train-rush',
    name: 'Train Rush',
    slug: 'train-rush',
    description:
      'Competitive multiplayer puzzle game. Players race to build connected railway routes from start to destination by rotating and placing track pieces on a grid. Features special events, obstacles, and simultaneous gameplay.',
    category: CATEGORY_STRATEGY,
    players: { min: 2, max: 6 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/train-rush/icon.svg',
    bannerUrl: '/games/train-rush/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
  {
    id: 'uno-cards',
    name: 'UNO-Style Cards',
    slug: 'uno-cards',
    description:
      'Original multiplayer color-and-number shedding card game inspired by classic card games. Features number cards, special action cards, wild cards, configurable rules, and server-authoritative private-hand management. > **IMPORTANT:** Do NOT copy UNO branding, artwork, exact card designs, or proprietary presentation. Create an original game identity and card system.',
    category: CATEGORY_CARD,
    players: { min: 2, max: 6 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/uno-cards/icon.svg',
    bannerUrl: '/games/uno-cards/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
  {
    id: 'carrom',
    name: 'Carrom',
    slug: 'carrom',
    description:
      'Polished multiplayer 2D Carrom game. Realistic but approachable physics, directional aiming with power control, pocketing mechanics, queen rules, and full multiplayer sync.',
    category: CATEGORY_BOARD,
    players: { min: 2, max: 4 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/carrom/icon.svg',
    bannerUrl: '/games/carrom/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT, TAG_PHYSICS, TAG_SOLO],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
];
