import type { GameDefinition } from '@playdeck/game-types';
import {
  STATUS_COMING_SOON,
  BADGE_COMING_SOON,
  RELEASE_DATE_COMING_SOON,
  TAG_MULTIPLAYER,
  TAG_VOICE_CHAT,
  TAG_PARTY,
  TAG_SOCIAL_DECEPTION,
  CATEGORY_CASUAL,
} from './constants';

export const COMING_SOON_CASUAL_GAMES_1: GameDefinition[] = [
  {
    id: 'alibi',
    name: 'Alibi',
    slug: 'alibi',
    description:
      'Everyone receives a slightly different version of an event. Players discuss what happened and identify whose version contains deliberate inconsistencies.',
    category: CATEGORY_CASUAL,
    players: { min: 4, max: 8 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/alibi/icon.svg',
    bannerUrl: '/games/alibi/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT, TAG_PARTY, TAG_SOCIAL_DECEPTION],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
  {
    id: 'imposter-builder',
    name: 'Imposter Builder',
    slug: 'imposter-builder',
    description:
      'Everyone receives instructions to build the same object, except one player receives subtly different instructions. After the build, everyone votes on who the imposter is.',
    category: CATEGORY_CASUAL,
    players: { min: 4, max: 8 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/imposter-builder/icon.svg',
    bannerUrl: '/games/imposter-builder/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT, TAG_PARTY, TAG_SOCIAL_DECEPTION],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
];
