import type { GameDefinition } from '@playdeck/game-types';
import {
  STATUS_COMING_SOON,
  BADGE_COMING_SOON,
  RELEASE_DATE_COMING_SOON,
  TAG_MULTIPLAYER,
  TAG_VOICE_CHAT,
  CATEGORY_CASUAL,
} from './constants';

export const COMING_SOON_CASUAL_GAMES_2: GameDefinition[] = [
  {
    id: 'hide-and-seek',
    name: 'Hide & Seek',
    slug: 'hide-and-seek',
    description:
      'Multiplayer 2D Hide & Seek game. One or more seekers search a map while hiders survive until the timer ends. Features role-based abilities, multiple maps with interactive objects, and strategic voice chat rules.',
    category: CATEGORY_CASUAL,
    players: { min: 3, max: 8 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/hide-and-seek/icon.svg',
    bannerUrl: '/games/hide-and-seek/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
  {
    id: 'fishing-competition',
    name: 'Fishing Competition',
    slug: 'fishing-competition',
    description:
      'Relaxing but competitive multiplayer fishing game. Players compete to catch the most valuable fish within a time limit. Features casting, bite indicators, reel-in timing mechanics, line tension management, and multiple fishing locations.',
    category: CATEGORY_CASUAL,
    players: { min: 2, max: 6 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/fishing-competition/icon.svg',
    bannerUrl: '/games/fishing-competition/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
];
