import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const wordBattleGame = defineGameModule({
  id: 'word-battle',
  description:
    'Race against opponents with shared letters in Word Battle on PlayDeck. Unearth rare words, outscore rival players, and clash in fast multiplayer anagram rounds.',
  category: GameCategories.P,
  players: getPCount(2, 8),
  releaseDate: GameReleaseDates.D_2026_09_25,
  tags: [GameTags.WP, GameTags.M_P, GameTags.S, GameTags.AI, GameTags.V_C],
  seo: {
    title: 'Word Battle — Real-Time Anagram & Vocabulary Game | PlayDeck',
    description:
      'Race against opponents with shared letters in Word Battle on PlayDeck. Unearth rare words, outscore rival players, and clash in fast multiplayer anagram rounds.',
    keywords: [
      'word battle game',
      'real-time word game',
      'multiplayer anagram game',
      'vocabulary duel online',
      'boggle style multiplayer',
      'word scramble battle',
      'competitive word puzzle',
      'playdeck word battle',
    ],
  },
  tagline: 'All players get the same letters. Race the clock and eliminate duplicates.',
  overview: [
    'Word Battle is a fast-paced multiplayer vocabulary competition where every contestant receives the exact same set of letter tiles each round.',
    'Form as many valid English words as possible before the round timer expires. Longer words yield exponentially higher points, while rare letters like Q, Z, and X trigger major bonuses.',
    'Watch out for the duplicate elimination rule: words found by multiple players clash and score zero or reduced points, rewarding original thinkers and deep lexicons.',
  ],
  howToPlay: [
    {
      title: 'Analyze the letter rack',
      description:
        'Every round opens with a shared letter rack containing guaranteed anagrams and diverse word possibilities.',
    },
    {
      title: 'Compose valid words',
      description:
        'Click the tactile letter tiles or type directly on your keyboard to string together words with at least 3 letters.',
    },
    {
      title: 'Submit before time expires',
      description:
        'Press Enter or the Submit button to record valid words into your round log and build consecutive combo streaks.',
    },
    {
      title: 'Review the clash results',
      description:
        'At round end, all submissions are revealed simultaneously. Unique words score full points while duplicate words clash and lose points.',
    },
  ],
  rules: [
    {
      title: 'Letter inventory constraint',
      description:
        'Words must be formed solely from the letters in your rack. Duplicate letters require matching duplicates in the rack.',
    },
    {
      title: 'Exponential length scoring',
      description:
        'Points scale upward rapidly: 3 letters (100), 4 letters (200), 5 letters (400), 6 letters (700), 7 letters (1,100), and 8+ letters (1,600).',
    },
    {
      title: 'Duplicate word elimination',
      description:
        'In Cancelled mode, words submitted by two or more players yield zero points. In Reduced mode, duplicate words award 50% points.',
    },
    {
      title: 'Full rack pangram bonus',
      description:
        'Using every unique letter on your rack or finding the target root anagram awards a massive +500 point bonus.',
    },
  ],
  controls: [
    {
      key: 'A–Z Keys / Tap Tiles',
      action: 'Select and place letter tiles into the input box',
    },
    {
      key: 'Enter / Tap Submit',
      action: 'Validate and submit the current word',
    },
    {
      key: 'Backspace / Tap Letter',
      action: 'Delete or remove letters from the current word',
    },
    {
      key: 'Spacebar / Tap Shuffle',
      action: 'Shuffle rack tiles to discover new anagram combinations',
    },
    {
      key: 'Escape / Tap Clear',
      action: 'Clear all placed tiles from the input box',
    },
  ],
  tips: [
    'Always shuffle the rack if you feel stuck—reordering consonants and vowels triggers new mental connections.',
    'Prioritize 5, 6, and 7-letter words; their exponential point values outscore multiple common 3-letter words.',
    'Avoid obvious 3-letter words against human opponents to minimize the risk of duplicate clash penalties.',
    'Look for common prefixes (UN, RE, DIS) and suffixes (ED, ER, ES, ING) present in the rack.',
  ],
  faq: [
    {
      question: 'What game modes are available in Word Battle?',
      answer:
        'Word Battle features Classic (standard timed race), Speed Rush (30s rapid combos), Longest Word (length multipliers), Anagram Battle (root unscramble hunt), and Team Battle (Red vs Blue).',
    },
    {
      question: 'How does the duplicate rule work?',
      answer:
        'By default (Cancelled), if two players find the word "PLANET", neither player receives points. This rewards discovering rare and unexpected words.',
    },
    {
      question: 'Can I play solo against AI bots?',
      answer:
        'Yes! You can battle 1 to 4 AI opponents (LexiBot, WordSmith, VocabViper, and AnagramAce), each with different vocabularies, speeds, and strategies.',
    },
  ],
});

export const wordBattleContent = wordBattleGame.content;
export const wordBattleDefinition = wordBattleGame.definition;
