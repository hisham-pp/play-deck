import type { GameContent } from '@playdeck/game-types';

export const stickmanPlatformerContent: GameContent = {
  id: 'stickman-platformer',
  seo: {
    title: 'Stickman Platformer — 2D Jump & Run Game | PlayDeck',
    description:
      'Guide your agile stickman hero across dangerous platforms, collect coins, conquer tricky traps, and clear every stage in Stickman Platformer on PlayDeck.',
    keywords: [
      'stickman platformer',
      '2d platformer game',
      'arcade jump run',
      'browser platformer',
      'stickman adventure',
      'play stickman platformer',
    ],
  },
  tagline: 'Leap across floating platforms, dodge perils, and reach the exit portal.',
  overview: [
    'Stickman Platformer is a classic side-view 2D platforming adventure where players leap across moving platforms, activate mid-stage checkpoints, and dodge lethal spike pits.',
    'Carefully pace your jumps, stomp roaming patrol foes, and gather radiant coins scattered across multi-tiered levels. Each world features unique terrain elements like bouncy spring pads and shifting platforms.',
    'Test your agility across three escalating gauntlets from the Training Grotto to the treacherous Spire Summit. Responsive controls and checkpoint mechanics deliver a satisfying arcade experience.',
  ],
  howToPlay: [
    {
      title: 'Move and traverse',
      description:
        'Use A/D, the arrow keys, or on-screen directional buttons to sprint across platforms.',
    },
    {
      title: 'Time your jumps',
      description:
        'Press Space, W, Up arrow, or the touch Jump button to clear gaps and hop over traps.',
    },
    {
      title: 'Claim checkpoints',
      description:
        'Pass through checkpoint flags to save your progress and respawn safely after taking damage.',
    },
    {
      title: 'Reach the portal',
      description:
        'Navigate through the hazards at the end of each stage to enter the exit portal and advance.',
    },
  ],
  rules: [
    {
      title: 'Three lives per run',
      description:
        'You start with 3 lives. Falling into pits or colliding with hazards costs a life and respawns you at the last checkpoint.',
    },
    {
      title: 'Stomp enemies from above',
      description:
        'Landing directly on top of roaming foes neutralizes them and grants bonus points.',
    },
    {
      title: 'Bouncy platforms launch you higher',
      description:
        'Special purple pads launch your stickman with elevated vertical impulse to reach high ledges.',
    },
    {
      title: 'Stage clear bonuses',
      description:
        'Reaching the exit portal awards high-value completion score multipliers for fast stage progression.',
    },
  ],
  controls: [
    { key: 'A / D or ← / →', action: 'Move left and right' },
    { key: 'Space / W / ↑', action: 'Jump' },
    { key: 'P', action: 'Pause / Resume game' },
    { key: 'R', action: 'Restart run from level 1' },
    {
      key: 'On-screen Touch Controls',
      action: 'Dedicated Left, Right, and Jump buttons on mobile',
    },
  ],
  tips: [
    'Use bouncy spring pads to reach secret elevated coin rows that are impossible to reach with a standard jump.',
    'Never rush past a checkpoint flag; touching it ensures you do not have to restart from the beginning of the world.',
    'Watch the patrol rhythm of enemies before dropping down from higher platforms.',
    'Moving platforms reverse direction at their boundaries—wait for the platform to reach you rather than making risky leaps.',
  ],
  faq: [
    {
      question: 'How do checkpoints work?',
      answer:
        'When you pass a checkpoint flag, it turns green and saves your position. If you fall or hit a trap, you respawn right there.',
    },
    {
      question: 'Can I play Stickman Platformer on a phone or tablet?',
      answer:
        'Yes. The game includes on-screen touch arrow buttons and a large Jump button designed for smooth mobile play.',
    },
    {
      question: 'How many levels are available?',
      answer:
        'Stickman Platformer currently features 3 handcrafted stages with unique hazards, bouncy surfaces, and moving platforms.',
    },
  ],
};
