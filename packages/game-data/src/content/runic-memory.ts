import { defineGameModule } from '../core/base-game';
import { GameCategories, GameControlKeys, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const runicMemoryGame = defineGameModule({
  id: 'runic-memory',
  description:
    'Test your cognitive recall across ancient glowing sigils. Flip pairs to clear the board in minimum turns.',
  category: GameCategories.P,
  players: getPCount(1, 2),
  releaseDate: GameReleaseDates.D_2026_09_17,
  tags: [
    GameTags.BRAIN_TRAINING,
    GameTags.MEM,
    GameTags.SOLITAIRE,
    GameTags.MULTIPLAYER_READY,
    GameTags.V_C,
    GameTags.ARCANE,
  ],
  seo: {
    title: 'Play Runic Memory — Free Online Memory Match Game',
    description:
      'Play Runic Memory free in your browser. Flip glowing sigil pairs and clear the board in as few turns as possible, solo or against a friend with voice chat.',
    keywords: [
      'memory match game',
      'online concentration game',
      'card matching game free',
      'memory game 2 player',
      'brain training memory',
      'pairs game online',
    ],
  },
  tagline: 'Test your recall across ancient glowing sigils — clear the board in minimum turns.',
  overview: [
    'Runic Memory is concentration with a tighter scoring model. A grid of face-down sigils hides matching pairs; you flip two at a time and keep them if they match. Clear the board in as few turns as you can.',
    'Solo, it is a personal-best chase against your own turn count. In two-player mode you alternate flips and a successful match earns you another go, which turns the game into a race to bank pairs while denying your opponent information. Online rooms carry voice chat on the same channel as the game.',
  ],
  howToPlay: [
    {
      title: 'Flip the first sigil',
      description: 'Click or tap a face-down tile to reveal the rune beneath it.',
    },
    {
      title: 'Flip a second',
      description:
        'Reveal another tile. If the two sigils match they stay face up and the pair is cleared.',
    },
    {
      title: 'Remember the misses',
      description:
        'If they do not match, both flip back. What you saw is the only advantage you carry into the next turn.',
    },
    {
      title: 'Clear the board',
      description:
        'Match every pair to finish. Fewer turns means a better result, so guesswork is expensive.',
    },
  ],
  rules: [
    {
      title: 'Two tiles per turn',
      description: 'You may reveal exactly two tiles in a turn before they resolve.',
    },
    {
      title: 'Matches stay revealed',
      description:
        'A matched pair is removed from play and stays face up for the rest of the board.',
    },
    {
      title: 'Misses flip back',
      description: 'A non-matching pair turns face down again after a brief reveal.',
    },
    {
      title: 'A match earns another turn',
      description:
        'In two-player mode, matching a pair lets you go again — chains of matches can decide the game.',
    },
  ],
  controls: [
    {
      key: GameControlKeys.ARROWS,
      action: 'Move tile selection',
    },
    {
      key: GameControlKeys.SPACE_ENTER,
      action: 'Flip selected tile',
    },
    {
      key: GameControlKeys.R_RESTART,
      action: 'Restart board',
    },
    {
      key: GameControlKeys.MOUSE_TOUCH,
      action: 'Click or tap a tile',
    },
  ],
  tips: [
    'Sweep in a fixed order on your first pass. A systematic reveal builds a mental map far better than random flipping.',
    'Anchor positions to the grid, not the picture. "Second row, third column" survives in memory longer than "the one near the middle".',
    'When you know one half of a pair, always flip that known tile second — it lets you confirm a guess without wasting the information.',
    'In two-player mode, avoid revealing a new tile next to a known one when you are ahead. Denying information is worth as much as scoring.',
  ],
  faq: [
    {
      question: 'Is Runic Memory single or multiplayer?',
      answer:
        'Both. Play solo against your own turn count, or take turns with another player — including online rooms with voice chat.',
    },
    {
      question: 'Does the board change between games?',
      answer: 'Yes. Sigil positions are shuffled for every new board.',
    },
    {
      question: 'Is it good for memory training?',
      answer:
        'It exercises short-term spatial recall, which is the same faculty classic concentration games train.',
    },
    {
      question: 'Can I play with the keyboard?',
      answer: 'Yes. Arrow keys move the selection and Space or Enter flips the highlighted tile.',
    },
  ],
});

export const runicMemoryContent = runicMemoryGame.content;
export const runicMemoryDefinition = runicMemoryGame.definition;
