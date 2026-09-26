import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const spellingBeeGame = defineGameModule({
  id: 'spelling-bee',
  name: 'Spelling Bee',
  description:
    'Find as many words as possible using seven honeycomb letters. Every word must include the center letter in this addictive word puzzle and multiplayer game.',
  category: GameCategories.P,
  players: getPCount(1, 6),
  releaseDate: '2026-09-20',
  tags: [GameTags.M_P, GameTags.V_C, GameTags.S, GameTags.WP],
  featured: true,
  seo: {
    title: 'Spelling Bee — Honeycomb Word Finder Puzzle Game',
    description:
      'Find as many words as possible using seven honeycomb letters. Every word must include the center letter in this addictive word puzzle and multiplayer game.',
    keywords: [
      'spelling bee',
      'honeycomb word game',
      'word puzzle',
      'pangram game',
      'vocabulary game',
      'daily word puzzle',
      'multiplayer word game',
      'word finder',
    ],
  },
  tagline: 'How many words can you make with seven letters? Find the Pangram and reach Queen Bee!',
  overview: [
    'Spelling Bee is a word-finding puzzle where players construct words from seven letters arranged in a honeycomb cluster.',
    'Every word must include the golden center letter and be at least four letters long. Letters can be reused as many times as you like. Words that utilize all seven letters earn a prestigious Pangram bonus.',
    'Compete solo against daily rank tiers from Beginner to Queen Bee, or challenge friends in real-time Race and Relay multiplayer modes with live WebRTC voice chat.',
  ],
  howToPlay: [
    {
      title: '1. Inspect the Honeycomb',
      description:
        'Your grid contains one mandatory center letter in gold and six outer letters in slate. Every valid word must use the center letter.',
    },
    {
      title: '2. Form Words of 4+ Letters',
      description:
        'Tap the hexagonal tiles or type on your keyboard to build words. You can repeat letters as often as you want.',
    },
    {
      title: '3. Discover the Pangram',
      description:
        'At least one word in every puzzle uses all seven distinct letters. Finding a pangram awards an extra +7 point bonus!',
    },
    {
      title: '4. Climb to Queen Bee',
      description:
        'Accumulate points to progress through rank tiers: Beginner, Good, Solid, Great, Amazing, Genius, and Queen Bee.',
    },
  ],
  rules: [
    {
      title: 'Word Length',
      description: 'Words must be at least four letters long to count towards your score.',
    },
    {
      title: 'Center Letter Required',
      description: 'Every submitted word must contain the center letter at least once.',
    },
    {
      title: 'Letter Reuse',
      description: 'Letters can be used more than once in any word (e.g. "TEETH", "COCOON").',
    },
    {
      title: 'Valid Words',
      description:
        'Proper nouns, hyphenated words, and offensive words are excluded from the dictionary.',
    },
    {
      title: 'Scoring',
      description:
        '4-letter words earn 1 point. Longer words score 1 point per letter. Pangrams score length + 7 bonus points.',
    },
  ],
  controls: [
    {
      key: 'Click / Tap Tiles',
      action: 'Add a letter to your current word submission.',
    },
    {
      key: 'Keyboard Letters (A–Z)',
      action: 'Type letters directly using your physical keyboard.',
    },
    {
      key: 'Enter / Return',
      action: 'Submit your word for validation and scoring.',
    },
    {
      key: 'Backspace',
      action: 'Delete the last entered letter from your word.',
    },
    {
      key: 'Spacebar / Tab / ⟳',
      action: 'Shuffle outer letters to help spot new anagram combinations.',
    },
  ],
  tips: [
    'Check if you can add common prefixes and suffixes like -ED, -ER, -ES, UN-, or RE- to base words you have already found.',
    'When you feel stuck, press the shuffle button to rotate outer letters and trigger new pattern recognition.',
    'Try finding the pangram first — its +7 bonus will immediately propel your rank higher.',
    'Do not overlook simple four-letter words; they add up quickly and build your foundation toward Queen Bee.',
  ],
  faq: [
    {
      question: 'What is a pangram?',
      answer:
        'A pangram is a word that uses every single one of the seven letters in the honeycomb at least once. Every puzzle has at least one pangram, which gives a +7 bonus.',
    },
    {
      question: 'Can I play with friends?',
      answer:
        'Yes! Spelling Bee features real-time multiplayer Race mode where everyone shares the same honeycomb, as well as Relay mode with integrated voice chat.',
    },
    {
      question: 'Does the daily puzzle reset every day?',
      answer:
        'Yes, the Daily Challenge provides a fresh deterministic honeycomb puzzle every midnight UTC based on the calendar date.',
    },
  ],
});

export const spellingBeeContent = spellingBeeGame.content;
export const spellingBeeDefinition = spellingBeeGame.definition;
