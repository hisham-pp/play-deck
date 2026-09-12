import type { GameControlItem } from './GameControlsTab';
import type { GameRuleItem } from './GameTemplateTabs';

export const DEFAULT_CONTROLS: Record<string, GameControlItem[]> = {
  snake: [
    { key: 'W / ↑', action: 'Move Up' },
    { key: 'S / ↓', action: 'Move Down' },
    { key: 'A / ←', action: 'Move Left' },
    { key: 'D / →', action: 'Move Right' },
    { key: 'Space', action: 'Pause / Resume' },
    { key: 'R', action: 'Restart Game' },
  ],
  'tic-tac-toe': [
    { key: '1 – 9', action: 'Direct Cell Placement' },
    { key: 'Arrow Keys', action: 'Navigate Grid Focus' },
    { key: 'Enter / Space', action: 'Confirm Cell Selection' },
    { key: 'R', action: 'Restart Current Round' },
    { key: 'Mouse / Touch', action: 'Tap / Click Cell' },
  ],
};

export const DEFAULT_RULES: Record<string, GameRuleItem[]> = {
  snake: [
    {
      title: 'Eat Pellets',
      description:
        'Guide the snake to consume energy pellets to grow your length and increase your score.',
    },
    {
      title: 'Avoid Collisions',
      description:
        'Do not collide with the perimeter boundaries or loop into your own body segments.',
    },
    {
      title: 'Speed Progression',
      description: 'Snake velocity gradually increases as your score escalates.',
    },
  ],
  'tic-tac-toe': [
    {
      title: '3-in-a-Row Alignment',
      description:
        'Place 3 of your marks horizontally, vertically, or diagonally across the 3x3 grid to claim victory.',
    },
    {
      title: 'Turn Alternation',
      description:
        'Player X leads Round 1. In subsequent rounds, the opening player alternates to maintain fair competitive advantage.',
    },
    {
      title: 'Stalemate Draws',
      description:
        'When all 9 grid cells are filled without a 3-in-a-row alignment, the round ends in a draw.',
    },
    {
      title: 'AI Difficulties',
      description:
        'Battle against Easy (random moves), Medium (tactical blocking/winning), or Hard (optimal unbeatable Minimax).',
    },
  ],
};
