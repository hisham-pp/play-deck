import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const telephoneDrawingGame = defineGameModule({
  id: 'telephone-drawing',
  description:
    'Player A gets a phrase → draws it → Player B describes the drawing → Player C draws that description → chain continues → final result is compared with the original phrase.',
  category: GameCategories.CS,
  players: getPCount(3, 8),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.S],
  seo: {
    title: 'Telephone Drawing — Hilarious Chain Drawing Party Game',
    description:
      'Draw a prompt, describe a doodle, and watch the chain mutate into hilarious chaos. A multiplayer party game with canvas tools, live reveal, and voice chat.',
    keywords: [
      'telephone drawing',
      'party game',
      'draw and guess',
      'sketch chain game',
      'multiplayer drawing',
      'doodle telephone',
      'voice chat party game',
      'fun party games',
    ],
  },
  tagline: 'Draw it, guess it, and watch simple phrases evolve into pure comedic madness!',
  overview: [
    'Telephone Drawing combines the classic whispering telephone parlor game with chaotic sketchpad mechanics. One player receives a secret phrase and attempts to sketch it under a ticking clock.',
    'The next player sees only the drawing and must guess what it depicts in words. The following player receives only that description and must draw it again. The chain continues until all players have contributed.',
    'At the grand reveal, everyone gathers on voice chat to watch a step-by-step slideshow showing exactly where the chain went hilariously off course, followed by voting on the most unforgettable mutations.',
  ],
  howToPlay: [
    {
      title: '1. Secret Phrase Assigned',
      description:
        'Player 1 receives a secret phrase and has 45 seconds to sketch it using the drawing canvas.',
    },
    {
      title: '2. Guess the Drawing',
      description:
        'Player 2 sees ONLY the drawing and types what they believe it portrays in a single sentence.',
    },
    {
      title: '3. Sketch the Guess',
      description: 'Player 3 receives ONLY Player 2’s description and must sketch it from scratch.',
    },
    {
      title: '4. The Grand Reveal',
      description:
        'Once every player completes their turn, the entire chain is revealed card by card with voice reactions.',
    },
    {
      title: '5. Vote for Funniest Mutation',
      description:
        'Everyone votes for the step that caused the funniest misunderstanding. Bonus points are awarded for accuracy!',
    },
  ],
  rules: [
    {
      title: 'Strict Secrecy',
      description:
        'Players only ever see the immediately preceding step. Future and past chain steps remain hidden until the reveal phase.',
    },
    {
      title: 'No Letters or Numbers in Drawings',
      description:
        'Sketches should rely on pictorial representation. Avoid writing the prompt in words directly on the canvas.',
    },
    {
      title: 'Self-Voting Restriction',
      description:
        'You cannot vote for your own drawing or description during the mutation voting phase.',
    },
    {
      title: 'Scoring Rules',
      description:
        'Players earn +100 points per vote received for funniest mutation, a +200 Crowd Favorite bonus, and a +150 Accuracy Master bonus if the chain survived intact.',
    },
  ],
  controls: [
    {
      key: 'Mouse / Touch Drag',
      action: 'Draw strokes on the canvas using pencil or eraser',
    },
    {
      key: 'Color Palette & Brush Sizes',
      action: 'Switch colors or adjust brush stroke thickness',
    },
    {
      key: 'Undo & Clear Canvas',
      action: 'Revert recent strokes or reset canvas surface',
    },
    {
      key: 'Keyboard Text Input',
      action: 'Type description guesses during describe turns',
    },
    {
      key: 'Microphone (M)',
      action: 'React and laugh with friends over live voice chat',
    },
  ],
  tips: [
    'Draw fast! Simple, expressive stick figures and distinctive props often convey ideas better than detailed sketches.',
    'Look for distinctive details in drawings—hats, postures, and background cues help decipher bizarre doodles.',
    'Embrace the chaos—half the fun is watching an innocent phrase transform into an absurd masterpiece.',
    'Keep your voice chat open so the whole group can laugh together during the grand slideshow reveal.',
  ],
  faq: [
    {
      question: 'How many players can play Telephone Drawing?',
      answer:
        'Telephone Drawing supports 3 to 8 players. In solo or smaller groups, built-in AI Sketcher bots can fill empty seats with varied drawing styles.',
    },
    {
      question: 'Does the game support touchscreens and tablets?',
      answer:
        'Yes! The canvas fully supports touch gestures and stylus input on mobile devices and tablets, alongside desktop mouse controls.',
    },
    {
      question: 'How are winners determined?',
      answer:
        'Points are tallied based on votes received for funniest mutations, crowd favorite awards, and accuracy bonuses when the chain preserves the original message.',
    },
  ],
});

export const telephoneDrawingContent = telephoneDrawingGame.content;
export const telephoneDrawingDefinition = telephoneDrawingGame.definition;
