import type { GameDefinition } from '@playdeck/game-types';
import {
  STATUS_COMING_SOON,
  BADGE_COMING_SOON,
  RELEASE_DATE_COMING_SOON,
  TAG_MULTIPLAYER,
  TAG_VOICE_CHAT,
  TAG_PHYSICS,
  CATEGORY_ARCADE,
} from './constants';

export const COMING_SOON_ARCADE_GAMES_2: GameDefinition[] = [
  {
    id: 'platform-race',
    name: 'Platform Race',
    slug: 'platform-race',
    description:
      'Polished multiplayer 2D platform racing game. Players race through obstacle courses featuring moving platforms, springs, rotating obstacles, boost pads, and checkpoints. First to the finish line wins.',
    category: CATEGORY_ARCADE,
    players: { min: 2, max: 6 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/platform-race/icon.svg',
    bannerUrl: '/games/platform-race/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT, TAG_PHYSICS],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
];
