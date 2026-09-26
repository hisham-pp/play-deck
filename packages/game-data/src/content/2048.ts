import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const game2048Game = defineGameModule({
  id: '2048',
  name: '2048',
  description:
    'Slide, merge, and forge tiles on a 4x4 grid to reach the coveted 2048 milestone. Featuring undo, smooth transitions, and persistent records.',
  category: GameCategories.P,
  players: getPCount(1),
  releaseDate: '2026-09-17',
  tags: [GameTags.PZ, GameTags.LOG, GameTags.S, GameTags.C, GameTags.HS, GameTags.T],
  seo: {
    title: 'Play 2048 Online Free — Slide, Merge, Reach 2048',
    description:
      'Play 2048 free in your browser. Slide tiles on a 4x4 grid, merge matching numbers, and chase the 2048 tile. Undo support and saved best scores.',
    keywords: [
      '2048 game',
      'play 2048 online',
      '2048 puzzle',
      'free 2048 no download',
      '2048 with undo',
      'number merge game',
    ],
  },
  tagline: 'Slide, merge, repeat — and try not to strand a 2 in the wrong corner.',
  overview: [
    '2048 is a sliding-tile puzzle played on a four-by-four grid. Every move pushes every tile in one direction, and two tiles showing the same number merge into one worth double. Reach a tile showing 2048 and you have solved it, though most players keep going for 4096 and beyond.',
    'The pressure comes from the spawns: after each move a new 2 or 4 appears in a random empty cell. When the grid fills and no adjacent pair can merge, the run is over. This build includes undo, smooth merge animations, and a best score kept in your browser between sessions.',
  ],
  howToPlay: [
    {
      title: 'Slide the whole grid',
      description:
        'Press a direction and every tile slides that way as far as it can. There is no moving a single tile on its own.',
    },
    {
      title: 'Merge matching pairs',
      description:
        'Two tiles with the same number that collide merge into one tile worth double, and the value is added to your score.',
    },
    {
      title: 'Handle the spawn',
      description:
        'A new 2 or 4 appears in a random empty cell after every move that changed the board. Leave room for it.',
    },
    {
      title: 'Reach 2048',
      description:
        'Keep compounding merges until a 2048 tile appears. You can carry on afterwards to push for a higher ceiling.',
    },
  ],
  rules: [
    {
      title: 'All tiles move together',
      description:
        'A direction input slides every tile on the board as far as it can go in that direction.',
    },
    {
      title: 'One merge per tile per move',
      description:
        'A tile created by a merge cannot merge again in the same move, so a row of four 2s becomes two 4s, not one 8.',
    },
    {
      title: 'Spawns follow valid moves',
      description:
        'A new tile only appears if the move actually changed the board. A blocked direction does nothing.',
    },
    {
      title: 'Game over on gridlock',
      description:
        'The run ends when the grid is full and no two neighbouring tiles share a value.',
    },
  ],
  controls: [
    {
      key: 'W / ↑',
      action: 'Slide up',
    },
    {
      key: 'S / ↓',
      action: 'Slide down',
    },
    {
      key: 'A / ←',
      action: 'Slide left',
    },
    {
      key: 'D / →',
      action: 'Slide right',
    },
    {
      key: 'U / Ctrl+Z',
      action: 'Undo last move',
    },
    {
      key: 'R',
      action: 'Restart game',
    },
    {
      key: 'Swipe',
      action: 'Slide in that direction (touch)',
    },
  ],
  tips: [
    'Pick a corner and never leave it. Keep your largest tile locked in one corner and build the rest of the board around it.',
    'Work two directions, not four. If your anchor is bottom-left, use only left and down until you genuinely have no option.',
    'Never press the direction that moves your anchor tile out of its corner — one careless up-press can cost the whole run.',
    'Build a descending chain along your anchor row so each tile has a merge partner waiting next to it.',
    'Use undo to recover from a reflex move, not to brute-force the board. The habit of thinking first scores higher.',
  ],
  faq: [
    {
      question: 'What is the goal of 2048?',
      answer:
        'Merge matching numbered tiles until one of them reads 2048. You can keep playing past that to chase a higher score.',
    },
    {
      question: 'Does this version have undo?',
      answer: 'Yes. Press U or Ctrl+Z to step back a move.',
    },
    {
      question: 'Is my best score saved?',
      answer:
        'Yes. Your best score is stored locally in your browser and persists between sessions on the same device.',
    },
    {
      question: 'Can I play 2048 with swipe controls?',
      answer: 'Yes. On touch devices, swipe in any direction to slide the grid.',
    },
  ],
});

export const game2048Content = game2048Game.content;
export const game2048Definition = game2048Game.definition;
