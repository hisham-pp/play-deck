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

export const COMING_SOON_ARCADE_GAMES_1: GameDefinition[] = [
  {
    id: 'tiny-tank-arena',
    name: 'Tiny Tank Arena',
    slug: 'tiny-tank-arena',
    description:
      'Small tanks fight in destructible arenas with limited ammunition and unusual weapons.',
    category: CATEGORY_ARCADE,
    players: { min: 2, max: 6 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/tiny-tank-arena/icon.svg',
    bannerUrl: '/games/tiny-tank-arena/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT, TAG_PHYSICS],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
  {
    id: 'loot-dash',
    name: 'Loot Dash',
    slug: 'loot-dash',
    description:
      'Players run around a tiny map collecting randomly spawning loot while avoiding traps and other players.',
    category: CATEGORY_ARCADE,
    players: { min: 2, max: 6 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/loot-dash/icon.svg',
    bannerUrl: '/games/loot-dash/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT, TAG_PHYSICS],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
];
