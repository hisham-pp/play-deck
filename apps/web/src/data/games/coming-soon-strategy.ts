import type { GameDefinition } from '@playdeck/game-types';
import {
  STATUS_COMING_SOON,
  BADGE_COMING_SOON,
  RELEASE_DATE_COMING_SOON,
  TAG_MULTIPLAYER,
  TAG_VOICE_CHAT,
  CATEGORY_STRATEGY,
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
];
