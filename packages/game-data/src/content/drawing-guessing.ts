import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const drawingGuessingGame = defineGameModule({
  id: 'drawing-guessing',
  name: 'Drawing & Guessing',
  description:
    'Play real-time Drawing & Guessing on PlayDeck. Sketch secret words, decipher sketches against the clock, and score points with smart near-miss typo alerts.',
  category: GameCategories.CS,
  players: getPCount(2, 8),
  releaseDate: '2026-09-25',
  tags: [GameTags.P, GameTags.M_P, GameTags.S, GameTags.AI, GameTags.V_C],
  featured: true,
  seo: {
    title: 'Drawing & Guessing — Sketch & Word Party Game | PlayDeck',
    description:
      'Play real-time Drawing & Guessing on PlayDeck. Sketch secret words, decipher sketches against the clock, and score points with smart near-miss typo alerts.',
    keywords: [
      'drawing and guessing game',
      'skribbl online',
      'multiplayer drawing game',
      'guess the drawing',
      'party sketch game',
      'pictionary online',
      'browser drawing party',
      'playdeck drawing',
    ],
  },
  tagline: 'Sketch fast, decipher clues, and type your guesses before the timer expires.',
  overview: [
    'Drawing & Guessing is a real-time multiplayer sketching party game inspired by classic parlor sketch games and online favorites.',
    'Players rotate as the lead artist, choosing a secret word from three difficulty tiers and sketching visual clues on an arcade canvas.',
    'Everyone else races against the clock to decipher the drawing in live chat, assisted by intelligent near-miss typo alerts and progressive hint reveals.',
  ],
  howToPlay: [
    {
      title: 'Choose your secret word',
      description:
        'When it is your turn to draw, select one of three secret words ranging from Easy to Hard with score multipliers.',
    },
    {
      title: 'Sketch visual clues on canvas',
      description:
        'Use colors, fine or jumbo stroke widths, and the eraser tool to sketch without writing out numbers or letters.',
    },
    {
      title: 'Type guesses in real-time chat',
      description:
        'When others are sketching, watch the strokes appear live and submit guesses in the chat box to race for points.',
    },
    {
      title: 'Capitalize on hints and near-misses',
      description:
        'One-letter typos trigger "SO CLOSE" alerts, and progressive letter reveals help break deadlocks as time counts down.',
    },
  ],
  rules: [
    {
      title: 'No written letters or numbers',
      description:
        'The artist must convey concepts through illustrations and doodles only—no writing the word or its spelling.',
    },
    {
      title: 'Time-decay scoring system',
      description:
        'Correct guesses award higher points the faster they are entered. The drawer earns bonus points for each player who guesses correctly.',
    },
    {
      title: 'Round completion',
      description:
        'A round ends when all guessing players solve the puzzle or when the round timer reaches zero.',
    },
  ],
  controls: [
    {
      key: 'Mouse Click / Touch Drag',
      action: 'Draw strokes on the sketchbook canvas',
    },
    {
      key: 'Color Palette & Sizes',
      action: 'Select brush color and stroke thickness',
    },
    {
      key: 'Eraser / Undo / Clear',
      action: 'Erase mistakes, undo strokes, or reset canvas',
    },
    {
      key: 'Chat Input & Enter',
      action: 'Type and submit guesses during drawing phase',
    },
  ],
  tips: [
    'Start with simple geometric silhouettes before adding intricate details.',
    'Keep an eye on the hint banner—revealed letters drastically narrow down word possibilities.',
    'Type fast! Scoring scales with remaining round time, so early guesses yield the highest rewards.',
    'If you see a "SO CLOSE" alert, check for a single typo or pluralization mistake.',
  ],
  faq: [
    {
      question: 'Can I play solo against AI bots?',
      answer:
        'Yes! Drawing & Guessing includes automated bots that sketch procedural drawings and guess words dynamically.',
    },
    {
      question: 'How do near-miss alerts work?',
      answer:
        'The game engine calculates Levenshtein edit distance in real time. If your guess is 1 character away from the word, a gold badge notifies you.',
    },
    {
      question: 'Is Drawing & Guessing playable on mobile devices?',
      answer:
        'Yes, the canvas supports full touch interactions and responsive scaling across smartphones, tablets, and desktops.',
    },
  ],
});

export const drawingGuessingContent = drawingGuessingGame.content;
export const drawingGuessingDefinition = drawingGuessingGame.definition;
