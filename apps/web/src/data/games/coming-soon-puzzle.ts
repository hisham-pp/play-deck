import type { GameDefinition } from '@playdeck/game-types';
import {
  STATUS_COMING_SOON,
  BADGE_COMING_SOON,
  RELEASE_DATE_COMING_SOON,
  TAG_MULTIPLAYER,
  TAG_VOICE_CHAT,
  TAG_SOLO,
  TAG_WORD_PUZZLE,
  CATEGORY_PUZZLE,
} from './constants';

export const COMING_SOON_PUZZLE_GAMES: GameDefinition[] = [
  {
    id: 'hangman-duel',
    name: 'Hangman Duel',
    slug: 'hangman-duel',
    description:
      'Polished multiplayer hangman game. One player sets a secret word while others guess letters to reveal it. Features player-chosen and category-based words, multiple game modes, and original illustrated hangman stages.',
    category: CATEGORY_PUZZLE,
    players: { min: 2, max: 6 },
    status: STATUS_COMING_SOON,
    thumbnailUrl: '/games/hangman-duel/icon.svg',
    bannerUrl: '/games/hangman-duel/cover.svg',
    tags: [TAG_MULTIPLAYER, TAG_VOICE_CHAT, TAG_SOLO, TAG_WORD_PUZZLE],
    featured: false,
    badge: BADGE_COMING_SOON,
    releaseDate: RELEASE_DATE_COMING_SOON,
  },
];
