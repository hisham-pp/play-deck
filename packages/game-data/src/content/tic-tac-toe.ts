import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const ticTacToeGame = defineGameModule({
  id: 'tic-tac-toe',
  name: 'Tic-Tac-Toe',
  description:
    'The classic two-player grid battle. Align three marks horizontally, vertically, or diagonally before your opponent.',
  category: GameCategories.S,
  players: getPCount(1, 2),
  releaseDate: '2026-09-12',
  tags: [GameTags.C, GameTags.TB, GameTags.QUICK_PLAY, GameTags.LP, GameTags.AI],
  seo: {
    title: 'Play Tic-Tac-Toe Online — 2 Player or vs AI',
    description:
      'Play Tic-Tac-Toe free in your browser. Take on a friend in local 2-player mode or face an unbeatable minimax AI across three difficulty levels.',
    keywords: [
      'tic tac toe online',
      'tic tac toe 2 player',
      'noughts and crosses',
      'tic tac toe vs computer',
      'unbeatable tic tac toe ai',
      'xo game',
    ],
  },
  tagline: 'Nine squares, two marks, and an AI that will punish every loose opening.',
  overview: [
    'Tic-Tac-Toe, also known as noughts and crosses, is the grid duel everyone learns first and almost nobody plays perfectly. Two players alternate placing marks on a three-by-three board, racing to line up three in a row horizontally, vertically, or diagonally.',
    'PlayDeck ships it with three AI difficulties. Easy plays at random, Medium blocks your wins and takes its own, and Hard runs a full minimax search, which makes it mathematically unbeatable — the best result available to you is a draw. Pass-and-play on one device works too, with the opening player alternating between rounds so neither side keeps the first-move advantage.',
  ],
  howToPlay: [
    {
      title: 'Pick your opponent',
      description:
        'Choose local 2-player pass-and-play, or select an AI difficulty from Easy, Medium, or Hard.',
    },
    {
      title: 'Place your mark',
      description:
        'Click or tap an empty cell, or use the number keys 1 through 9 to drop a mark straight into the matching square.',
    },
    {
      title: 'Build a line',
      description:
        'Get three of your marks in a row — across, down, or diagonally — before your opponent does.',
    },
    {
      title: 'Play the next round',
      description:
        'After a win or a draw, the next round starts with the opening player swapped so the advantage evens out.',
    },
  ],
  rules: [
    {
      title: '3-in-a-row alignment',
      description:
        'Place 3 of your marks horizontally, vertically, or diagonally across the 3x3 grid to claim victory.',
    },
    {
      title: 'Turn alternation',
      description:
        'Player X leads round 1. In subsequent rounds the opening player alternates to keep the first-move advantage fair.',
    },
    {
      title: 'Stalemate draws',
      description:
        'When all 9 grid cells are filled without a 3-in-a-row alignment, the round ends in a draw.',
    },
    {
      title: 'AI difficulties',
      description:
        'Battle Easy (random moves), Medium (tactical blocking and winning), or Hard (optimal, unbeatable minimax).',
    },
  ],
  controls: [
    {
      key: '1 – 9',
      action: 'Direct cell placement',
    },
    {
      key: 'Arrow keys',
      action: 'Navigate grid focus',
    },
    {
      key: 'Enter / Space',
      action: 'Confirm cell selection',
    },
    {
      key: 'R',
      action: 'Restart current round',
    },
    {
      key: 'Mouse / touch',
      action: 'Tap or click a cell',
    },
  ],
  tips: [
    'Open in the centre. It sits on four of the eight winning lines — more than any other square.',
    'If the centre is taken, take a corner. Corners belong to three winning lines each; edges only belong to two.',
    'Watch for the double threat. Winning against a competent opponent requires creating two winning lines at once, because they can only block one.',
    'Against the Hard AI, a draw is a perfect result. Tic-Tac-Toe is a solved game — optimal play by both sides always ends level.',
  ],
  faq: [
    {
      question: 'Can I play Tic-Tac-Toe with a friend on the same device?',
      answer:
        'Yes. Local 2-player pass-and-play is built in — you both use the same screen and take alternating turns.',
    },
    {
      question: 'Is the Hard AI actually unbeatable?',
      answer:
        'Yes. Hard uses a complete minimax search of the game tree, so it never makes a losing move. The best you can force is a draw.',
    },
    {
      question: 'Who goes first?',
      answer:
        'X opens the first round. After that the opening player alternates each round so neither side keeps the first-move advantage.',
    },
    {
      question: 'Do I need to install anything?',
      answer: 'No. The game runs in your browser with no download, install, or sign-up.',
    },
  ],
});

export const ticTacToeContent = ticTacToeGame.content;
export const ticTacToeDefinition = ticTacToeGame.definition;
