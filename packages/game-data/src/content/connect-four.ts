import { defineGameModule } from '../core/base-game';
import { GameCategories, GameControlKeys, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const connectFourGame = defineGameModule({
  id: 'connect-four',
  description:
    'A vertical gravity duel. Drop discs to align four in a row horizontally, vertically, or diagonally before your opponent.',
  category: GameCategories.S,
  players: getPCount(1, 2),
  releaseDate: GameReleaseDates.D_2026_09_13,
  tags: [GameTags.C, GameTags.ST, GameTags.GRAVITY_GRID, GameTags.LP, GameTags.AI],
  seo: {
    title: 'Play Connect Four Online — 2 Player or vs AI',
    description:
      'Play Connect Four free in your browser. Drop discs down a seven-column grid and line up four in a row against a friend or the AI. No download needed.',
    keywords: [
      'connect four online',
      'connect 4 2 player',
      'connect four vs computer',
      'four in a row game',
      'free connect four',
      'connect 4 no download',
    ],
  },
  tagline:
    'A vertical gravity duel — four in a row, and every disc you drop helps your opponent too.',
  overview: [
    'Connect Four is a solved game that still beats most people who play it. You drop discs into a seven-column, six-row grid and gravity takes them to the lowest free slot. Line up four of your colour horizontally, vertically or diagonally and you win — but every disc you place also builds a platform your opponent can land on.',
    'Play a friend on one device or take on the AI. Because gravity constrains every move to one of at most seven squares, the game rewards planning several drops ahead: the strong player is not the one who spots four in a row, but the one who sees which columns will be poisoned three moves from now.',
  ],
  howToPlay: [
    {
      title: 'Pick a column',
      description: 'Click a column, or move the drop cursor with the left and right arrow keys.',
    },
    {
      title: 'Drop the disc',
      description:
        'The disc falls to the lowest empty slot in that column. You never choose the row, only the column.',
    },
    {
      title: 'Build a threat',
      description:
        'Line up four of your discs in any direction — horizontal, vertical, or either diagonal.',
    },
    {
      title: 'Block and counter',
      description:
        'Watch your opponent’s three-in-a-rows and block them, but avoid blocks that hand them a winning square above.',
    },
  ],
  rules: [
    {
      title: 'Gravity decides the row',
      description: 'A disc always falls to the lowest unoccupied cell in the chosen column.',
    },
    {
      title: 'Four in a row wins',
      description:
        'Four of the same colour aligned horizontally, vertically or diagonally ends the game immediately.',
    },
    {
      title: 'Full columns are closed',
      description: 'Once a column holds six discs it can no longer be played.',
    },
    {
      title: 'A full board is a draw',
      description: 'If all 42 cells fill with no alignment, the game is drawn.',
    },
  ],
  controls: [
    {
      key: '← / →',
      action: 'Move drop cursor',
    },
    {
      key: '↓ / Enter / Space',
      action: 'Drop disc in selected column',
    },
    {
      key: GameControlKeys.R_RESTART,
      action: 'Restart game',
    },
    {
      key: GameControlKeys.MOUSE_TOUCH,
      action: 'Click a column to drop',
    },
  ],
  tips: [
    'Take the centre column. Discs there participate in more winning lines than any other column on the board.',
    'Think in pairs of rows. Placing a disc gives your opponent the square directly above it, so never build under their winning line.',
    'Set up a double threat: two three-in-a-rows that complete on different columns. Your opponent can only block one.',
    'Odd and even rows matter. As the first player, aim your threats at odd-numbered rows; as second player, aim at even ones.',
    'Count before you block. Sometimes an immediate block loses to the square you just created above it — a delay may be stronger.',
  ],
  faq: [
    {
      question: 'Can I play Connect Four against the computer?',
      answer:
        'Yes. You can face the built-in AI opponent, or play a friend locally on the same device.',
    },
    {
      question: 'How big is the board?',
      answer: 'Seven columns by six rows, the standard 42-cell Connect Four grid.',
    },
    {
      question: 'Does the first player always win?',
      answer:
        'With perfect play the first player can force a win by starting in the centre column, but that line is extremely hard to hold in practice.',
    },
    {
      question: 'Is Connect Four playable with a keyboard?',
      answer:
        'Yes. Use the left and right arrows to pick a column and the down arrow, Enter or Space to drop.',
    },
  ],
});

export const connectFourContent = connectFourGame.content;
export const connectFourDefinition = connectFourGame.definition;
