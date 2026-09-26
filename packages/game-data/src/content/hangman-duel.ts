import { defineGameModule } from '../core/base-game';
import { GameCategories, GameControlKeys, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const hangmanDuelGame = defineGameModule({
  id: 'hangman-duel',
  description:
    'Polished multiplayer hangman game. Guess letters, deduce secret words, and survive the gallows in competitive word duels.',
  category: GameCategories.P,
  players: getPCount(1, 6),
  releaseDate: GameReleaseDates.D_2026_09_26,
  tags: [GameTags.M_P, GameTags.V_C, GameTags.S, GameTags.WP],
  seo: {
    title: 'Hangman Duel — Multiplayer Word Guessing Battle | PlayDeck',
    description:
      'Outsmart opponents in classic and speed word duels, crack mystery phrases before the gallows completes, and master categories in Hangman Duel on PlayDeck.',
    keywords: [
      'hangman duel',
      'multiplayer hangman',
      'word guessing game',
      'word battle game',
      'browser hangman',
      'vocabulary duel',
      'word puzzle arcade',
    ],
  },
  tagline: 'Guess letters, deduce secret words, and survive the gallows in competitive word duels.',
  overview: [
    'Hangman Duel elevates the classic pen-and-paper letter guessing game into a competitive, high-stakes multiplayer arcade experience.',
    'Duel against AI or compete locally across Solo, Classic, Speed, and Battle modes. Choose from curated thematic categories like Animals, Movies, Food, Places, and Professions.',
    'Test vocabulary and deduction under ticking turn clocks, earning speed bonuses for rapid correct letter guesses while avoiding game-ending wrong strikes.',
  ],
  howToPlay: [
    {
      title: 'Choose game mode and category',
      description:
        'Select Solo Practice or 2-Player Versus, pick your preferred word category and difficulty, or let the game select random mystery words.',
    },
    {
      title: 'Guess letters strategically',
      description:
        'Tap on-screen letters or type on your keyboard to reveal matching positions in the hidden word. Start with common vowels and frequent consonants.',
    },
    {
      title: 'Watch the gallows stage',
      description:
        'Every incorrect letter adds a segment to the illustrated neon gallows. Reach the maximum allowed misses and the round is forfeited.',
    },
    {
      title: 'Speed bonus scoring',
      description:
        'Guessing correct letters during the opening seconds of a turn awards bonus speed points to vault up the scoreboard.',
    },
  ],
  rules: [
    {
      title: 'Allowed misses',
      description:
        'Players have 6 allowed wrong guesses per secret word before the hangman illustration is completed.',
    },
    {
      title: 'Scoring breakdown',
      description:
        'Each correct letter awards 10 points (plus 5 for duplicate occurrences) with a +15 speed bonus for fast answers.',
    },
    {
      title: 'Turn rotation',
      description:
        'In multiplayer modes, players take alternating turns guessing letters. Solving the complete word awards the round victory.',
    },
    {
      title: 'Round progression',
      description:
        'Matches span multiple rounds. The player with the highest accumulated score across all rounds wins the duel.',
    },
  ],
  controls: [
    {
      key: 'A — Z / Virtual Keyboard',
      action: 'Guess Letter',
    },
    {
      key: GameControlKeys.ENTER,
      action: 'Submit Guess',
    },
    {
      key: GameControlKeys.SPACE,
      action: 'Restart / Next Round',
    },
  ],
  tips: [
    'Vowels like E, A, and O appear in the vast majority of words — reveal them early to identify word patterns.',
    'Look at word length and letter positions to deduce common prefixes (RE-, UN-) and suffixes (-ING, -TION, -ED).',
    'Category hints provide crucial context for rare words — check the active topic badge before guessing.',
    'In speed mode, rapid guesses yield massive score bonuses, but careless misses can quickly exhaust your allowed strikes.',
  ],
  faq: [
    {
      question: 'Can two players duel locally on the same device?',
      answer:
        'Yes! Hangman Duel supports local 2-Player Versus where players take turns guessing or set secret words for each other.',
    },
    {
      question: 'What happens if I guess a letter already tried?',
      answer:
        'The game prevents duplicate letter submissions, so you never lose a miss on an already-tried character.',
    },
    {
      question: 'Are there difficulty presets?',
      answer:
        'Yes, you can choose from Easy (shorter common words), Medium, and Hard (complex vocabulary with rare letter combinations).',
    },
  ],
});

export const hangmanDuelContent = hangmanDuelGame.content;
export const hangmanDuelDefinition = hangmanDuelGame.definition;
