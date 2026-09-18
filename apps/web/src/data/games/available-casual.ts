import type { GameDefinition } from '@playdeck/game-types';
import {
  STATUS_AVAILABLE,
  BADGE_READY_TO_PLAY,
  TAG_AI_OPPONENT,
  TAG_LOCAL_PLAY,
  TAG_PARTY,
  CATEGORY_CASUAL,
} from './constants';

/** Playable party and casual games, kept apart from the arcade/puzzle roster. */
export const AVAILABLE_CASUAL_GAMES: GameDefinition[] = [
  {
    id: 'push-your-luck',
    name: 'Push Your Luck',
    slug: 'push-your-luck',
    description:
      'Every draw pays out, and every draw after that is likelier to wipe you out. Bank your pot while it is safe, or push once more and gamble the whole round away.',
    category: CATEGORY_CASUAL,
    players: { min: 1, max: 8 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/push-your-luck/icon.svg',
    bannerUrl: '/games/push-your-luck/cover.svg',
    tags: [TAG_PARTY, TAG_LOCAL_PLAY, TAG_AI_OPPONENT, 'Turn-based', 'Risk'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-18',
  },
];
