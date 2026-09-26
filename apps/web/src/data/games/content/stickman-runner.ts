import type { GameContent } from '@playdeck/game-types';

export const stickmanRunnerContent: GameContent = {
  id: 'stickman-runner',
  seo: {
    title: 'Stickman Runner — Endless Sprint Game | PlayDeck',
    description:
      'Dash through an endless neon sprint, leap over dangerous obstacles, and chase a new high score in Stickman Runner on PlayDeck.',
    keywords: [
      'stickman runner',
      'endless runner game',
      'arcade sprint game',
      'play stickman runner',
      'browser runner game',
      'jump dodge game',
    ],
  },
  tagline: 'Sprint, leap, and survive the endless hazard gauntlet.',
  overview: [
    'Stickman Runner is a fast-paced endless runner where your hero dashes forward through a dangerous corridor of rising barriers and collectible energy tokens.',
    'Each second on the course adds pressure: the pace ramps up, the hazard spacing tightens, and every clean jump matters. A single missed step ends the run, so rhythm and timing are everything.',
    'Collect radiant boosts to pad your score while dodging the towering barricades that close in from the right. The game is built for instant play—jump, react, and chase your personal best.',
  ],
  howToPlay: [
    {
      title: 'Start the run',
      description: 'Press Space, tap the game board, or hit the Jump button to begin your sprint.',
    },
    {
      title: 'Time each jump',
      description:
        'Leap over low barriers and observe incoming patterns before your rhythm breaks.',
    },
    {
      title: 'Collect energy orbs',
      description:
        'Grab glowing pickups to stack bonus points and sustain momentum through the speed ramp.',
    },
    {
      title: 'Stay alive and chase the score',
      description:
        'The longer you survive and the faster the pace climbs, the higher your score climbs.',
    },
  ],
  rules: [
    {
      title: 'One-touch collision ends the run',
      description: 'Any obstacle impact ends the sprint immediately and locks your final score.',
    },
    {
      title: 'Score grows with distance',
      description: 'Every passing second and cleared obstacle contributes to your total score.',
    },
    {
      title: 'Pickups add instant points',
      description:
        'Collecting bright reward cores awards bonus points and creates a higher-velocity chase.',
    },
    {
      title: 'High score persists locally',
      description:
        'Your best result is kept in the browser so each run builds toward a new record.',
    },
  ],
  controls: [
    { key: 'Space / ↑ / W', action: 'Jump' },
    { key: 'Tap / Click', action: 'Jump while playing' },
    { key: 'R', action: 'Restart run' },
  ],
  tips: [
    'Jump early rather than late. The runner has a consistent arc, and early timing keeps you safer in crowded gaps.',
    'Watch the obstacle rhythm instead of reacting to the last moment. Pattern recognition wins longer runs.',
    'Energy pickups are worth chasing, but never risk a collision just for a bonus orb.',
    'A calm, measured cadence is more reliable than frantic repeated jumps.',
  ],
  faq: [
    {
      question: 'How do I play Stickman Runner?',
      answer:
        'Press Space or tap the board to jump, then keep clearing obstacles while the speed climbs higher.',
    },
    {
      question: 'Does the game save my best score?',
      answer:
        'Yes. Your high score is stored in the local browser profile for repeat challenge runs.',
    },
    {
      question: 'Can I play on mobile?',
      answer:
        'Yes. The game supports tap controls in addition to keyboard input for quick play on phones and tablets.',
    },
  ],
};
