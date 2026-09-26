import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const wordChainGame = defineGameModule({
  id: 'word-chain',
  description:
    'Take turns playing words that start where the last one ended. Miss the timer and you lose a life — last player standing wins.',
  category: GameCategories.P,
  players: getPCount(1, 8),
  releaseDate: GameReleaseDates.D_2026_09_18,
  tags: [GameTags.WP, GameTags.PZ, GameTags.S, GameTags.LP, GameTags.M_P],
  seo: {
    title: 'Play Word Chain Online Free — Last Letter Word Game',
    description:
      'Play Word Chain free in your browser. Each word starts with the last letter of the one before it. Solo, points, team and elimination modes for up to 8 players.',
    keywords: [
      'word chain game',
      'last letter word game',
      'shiritori online',
      'word association game',
      'free word game',
      'multiplayer word game',
    ],
  },
  tagline: 'Every word starts where the last one ended. Run out of clock and you run out of lives.',
  overview: [
    'Word Chain is the oldest word game there is: someone says a word, and the next player has to answer with one that begins where it ended. Say "tiger" and the next word has to start with R. Miss the timer, lose a life. Keep it up and you are the last player standing.',
    'This build plays on one device for one to eight people, with the full dictionary behind it — every answer is checked against a real English word list, not a short curated one. Five rule variants change what counts as a valid link, from the standard last letter to a two-letter handover, a themed category lock, a clock that tightens every lap, and a minimum word length that grows as you go.',
  ],
  howToPlay: [
    {
      title: 'Pick a mode',
      description:
        'Classic is elimination, Points runs a fixed number of rounds, Team splits the table in two, and Solo is one player against the clock.',
    },
    {
      title: 'Read the letter',
      description:
        'The big amber letter is what your word has to start with. It comes from the end of the word just played.',
    },
    {
      title: 'Type and hit enter',
      description:
        'Words are checked live against the dictionary. A rejected word costs you nothing but time — try again before the clock runs out.',
    },
    {
      title: 'Watch the timer',
      description:
        'The bar under the status row is your turn. Let it empty and you lose a life, and the same letter passes to the next player.',
    },
    {
      title: 'Outlast the table',
      description:
        'Lives run out one at a time. The last player — or last team — still standing takes the game.',
    },
  ],
  rules: [
    {
      title: 'The chain links letter to letter',
      description:
        'Each word must begin with the final letter of the previous word, or the final two letters under the Last Two Letters variant.',
    },
    {
      title: 'Words must be real and long enough',
      description:
        'Every answer is validated against an English dictionary and has to be at least three letters long.',
    },
    {
      title: 'Nothing repeats',
      description:
        'A word played once is out for the rest of the game, including the opening word the chain starts from.',
    },
    {
      title: 'The clock costs lives, not the chain',
      description:
        'When time runs out the player loses a life and the turn passes, but the required letter stays exactly where it was.',
    },
    {
      title: 'Longer and faster scores more',
      description:
        'Words earn a base five points plus two per letter above the minimum, with a bonus for answering in the first 40% of the clock and ten points per life you finish with.',
    },
  ],
  controls: [
    {
      key: 'A–Z',
      action: 'Type your word',
    },
    {
      key: 'Enter',
      action: 'Play the word',
    },
    {
      key: 'Backspace',
      action: 'Correct your entry',
    },
    {
      key: 'Tab',
      action: 'Move to the pause and rules controls',
    },
    {
      key: 'Click / tap',
      action: 'Pause, resume or change the rules',
    },
  ],
  tips: [
    'Hoard words ending in the same letter they start with — trout, level, sees — so you can hand the same letter straight back.',
    'Letters like J, Q, X and Z are brutal to receive. Play a word ending in one when you want to squeeze the next player.',
    'Under the Growing Words variant, spend the early laps on short answers and save the long words for when the floor rises.',
    'The speed bonus is worth as much as three extra letters. A quick short word often beats a slow clever one.',
    'In Team mode the seating alternates sides, so your teammate never has to solve the letter you just created.',
  ],
  faq: [
    {
      question: 'How many people can play?',
      answer:
        'One to eight, all on the same device. Solo mode plays a single seat against the clock; every other mode passes the keyboard around the table.',
    },
    {
      question: 'Which dictionary is used?',
      answer:
        'A full English word list of around 240,000 entries, loaded a letter at a time so only the words you could actually need are downloaded.',
    },
    {
      question: 'What happens when time runs out?',
      answer:
        'The player loses a life and play moves on, but the chain does not — the next player still has to answer the same letter.',
    },
    {
      question: 'What are the rule variants?',
      answer:
        'Last Letter, Last Two Letters, Category Lock, Escalating Timer and Growing Words. Each one changes what counts as a legal link.',
    },
    {
      question: 'Can I play against people online?',
      answer:
        'Not yet. Word Chain currently plays around one device, with online rooms and voice chat planned alongside the rest of the PlayDeck multiplayer games.',
    },
  ],
});

export const wordChainContent = wordChainGame.content;
export const wordChainDefinition = wordChainGame.definition;
