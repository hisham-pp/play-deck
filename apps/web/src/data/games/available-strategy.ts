import type { GameDefinition } from '@playdeck/game-types';
import {
  STATUS_AVAILABLE,
  BADGE_READY_TO_PLAY,
  TAG_AI_OPPONENT,
  TAG_LOCAL_PLAY,
  TAG_MULTIPLAYER,
  TAG_VOICE_CHAT,
  CATEGORY_STRATEGY,
} from './constants';

/** Playable strategy games, kept apart from the arcade/puzzle roster. */
export const AVAILABLE_STRATEGY_GAMES: GameDefinition[] = [
  {
    id: 'color-thief',
    name: 'Color Thief',
    slug: 'color-thief',
    description:
      'Steal the grid one tile at a time. Paint that touches your own territory is cheap, isolated captures cost dearly, and every colour hides an ability nobody sees until it fires.',
    category: CATEGORY_STRATEGY,
    players: { min: 2, max: 6 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/color-thief/icon.svg',
    bannerUrl: '/games/color-thief/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT, TAG_LOCAL_PLAY, TAG_AI_OPPONENT, 'Turn-based'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-18',
  },
  {
    id: 'dont-pop-it',
    name: "Don't Pop It",
    slug: 'dont-pop-it',
    description:
      'Multiplayer push-your-luck strategy game where players take turns uncovering mystery tiles while dodging hidden pop hazards. Collect shields, bonus gems, and multipliers.',
    category: CATEGORY_STRATEGY,
    players: { min: 1, max: 4 },
    status: STATUS_AVAILABLE,
    thumbnailUrl: '/games/dont-pop-it/icon.svg',
    bannerUrl: '/games/dont-pop-it/cover.svg',
    tags: [TAG_LOCAL_PLAY, TAG_AI_OPPONENT, TAG_MULTIPLAYER, TAG_VOICE_CHAT, 'Turn-based'],
    featured: true,
    badge: BADGE_READY_TO_PLAY,
    releaseDate: '2026-09-24',
  },
];
