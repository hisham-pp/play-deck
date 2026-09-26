import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const tetrisGame = defineGameModule({
  id: 'tetris',
  name: 'Tetris',
  description:
    'Rotate and stack falling tetrominoes to clear lines before the board overflows. Speed ramps up with every level.',
  category: GameCategories.P,
  players: getPCount(1),
  releaseDate: '2026-09-12',
  tags: [GameTags.A, GameTags.C, GameTags.PZ, GameTags.HS],
  featured: true,
  seo: {
    title: 'Play Tetris Online Free — Stack, Clear, Survive',
    description:
      'Play Tetris free in your browser. Rotate and stack tetrominoes, clear lines, hold pieces, and hard drop your way up the level curve. No download required.',
    keywords: [
      'tetris online',
      'play tetris free',
      'tetris browser game',
      'falling blocks game',
      'tetromino puzzle',
      'tetris no download',
    ],
  },
  tagline: 'Seven shapes, one well, and a gravity curve that never forgives a bad stack.',
  overview: [
    'Tetris hands you an endless stream of seven tetromino shapes and a ten-column well to fit them into. Complete a horizontal row and it clears, dropping everything above it down a line. Fail to clear fast enough and the stack climbs to the ceiling, which is the only way the game ever ends.',
    'This build includes the features competitive players expect: a hold queue, a next-piece preview, a ghost piece showing where the current tetromino will land, soft drop, and instant hard drop. Gravity accelerates with every level, so the same stack that felt comfortable at level three becomes a scramble at level twelve.',
  ],
  howToPlay: [
    {
      title: 'Read the queue',
      description:
        'The preview shows what is coming next. Decide where the current piece goes based on the one after it, not the one in your hand.',
    },
    {
      title: 'Position and rotate',
      description:
        'Move the falling tetromino left and right and rotate it clockwise or counter-clockwise until it fits the gap you picked.',
    },
    {
      title: 'Drop it',
      description:
        'Soft drop to nudge the piece down with control, or hard drop to slam it into place instantly and bank the time.',
    },
    {
      title: 'Clear lines',
      description:
        'Fill a full row across all ten columns to clear it. Clearing several rows at once scores far more than clearing them one at a time.',
    },
    {
      title: 'Bank a piece',
      description:
        'Hold swaps the current tetromino into storage for later — essential for saving an I-piece until you need the Tetris.',
    },
  ],
  rules: [
    {
      title: 'Line clears',
      description:
        'A row that is filled across all ten columns clears and everything stacked above it shifts down one line.',
    },
    {
      title: 'Scoring scales with volume',
      description:
        'Clearing four rows in one drop (a Tetris) is worth dramatically more than four separate single clears.',
    },
    {
      title: 'Level progression',
      description:
        'Levels advance as you clear lines, and each level increases gravity so pieces fall faster.',
    },
    {
      title: 'Hold is once per piece',
      description:
        'You may swap the active piece into the hold slot once per drop. It unlocks again after the next piece locks down.',
    },
    {
      title: 'Top out ends the run',
      description:
        'If a new tetromino cannot spawn because the stack has reached the top of the well, the game is over.',
    },
  ],
  controls: [
    {
      key: 'A / ←',
      action: 'Move left',
    },
    {
      key: 'D / →',
      action: 'Move right',
    },
    {
      key: 'S / ↓',
      action: 'Soft drop',
    },
    {
      key: 'Space',
      action: 'Hard drop',
    },
    {
      key: 'W / ↑ / X',
      action: 'Rotate clockwise',
    },
    {
      key: 'Z / Ctrl',
      action: 'Rotate counter-clockwise',
    },
    {
      key: 'C / Shift',
      action: 'Hold piece',
    },
    {
      key: 'P / Esc',
      action: 'Pause / resume',
    },
    {
      key: 'R',
      action: 'Restart game',
    },
  ],
  tips: [
    'Keep the stack flat. A jagged surface forces you to waste pieces patching holes instead of clearing lines.',
    'Reserve one well column — usually the far right — and feed everything else flat, then drop an I-piece for a four-line Tetris.',
    'Never bury a hole. One covered empty cell costs you every line above it until you dig it back out.',
    'Use hold proactively, not as a panic button. Bank the I-piece early so it is there when your well is four rows deep.',
    'At high levels, rotate before you move. Rotation near a wall can fail if the piece has nowhere to kick into.',
  ],
  faq: [
    {
      question: 'Is this Tetris free to play?',
      answer:
        'Yes. It runs entirely in your browser with no download, no install, and no account required.',
    },
    {
      question: 'Does it have hold and hard drop?',
      answer:
        'Yes. Hold is mapped to C or Shift, and hard drop to the spacebar. A ghost piece shows the landing position before you commit.',
    },
    {
      question: 'How does scoring work?',
      answer:
        'Points scale with how many rows you clear in a single drop and with your current level, so a four-line Tetris at a high level is worth far more than four singles.',
    },
    {
      question: 'Can I play Tetris on my phone?',
      answer:
        'Yes. The board is responsive and on-screen touch controls replace the keyboard on smaller screens.',
    },
  ],
});

export const tetrisContent = tetrisGame.content;
export const tetrisDefinition = tetrisGame.definition;
