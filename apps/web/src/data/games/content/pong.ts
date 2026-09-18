import type { GameContent } from '@playdeck/game-types';

export const pongContent: GameContent = {
  id: 'pong',
  seo: {
    title: 'Play Pong Online Free — 2 Player Paddle Duel',
    description:
      'Play the original Pong free in your browser. Deflect the accelerating ball, master angled shots, and outrally the AI or a friend in local 2-player mode.',
    keywords: [
      'pong online',
      'play pong free',
      'pong 2 player',
      'classic pong game',
      'retro paddle game',
      'pong vs computer',
    ],
  },
  tagline: 'The timeless paddle duel — deflect, angle, and outlast.',
  overview: [
    'Pong is the game that started the industry, and it is still a genuine test of reaction and angle control. Two paddles guard opposite edges of the court while a ball accelerates between them. Miss it and your opponent scores.',
    'The depth is in the deflection. Where the ball strikes your paddle changes the angle it leaves at, so a hit near the edge fires a steep return that is far harder to reach than a flat centre bounce. Play the AI solo, or share a keyboard for a local two-player match where one player takes W and S and the other takes the arrow keys.',
  ],
  howToPlay: [
    {
      title: 'Serve the ball',
      description: 'Press Space to launch the ball and begin the rally.',
    },
    {
      title: 'Track and intercept',
      description:
        'Slide your paddle up and down to meet the ball before it reaches your edge of the court.',
    },
    {
      title: 'Aim with contact point',
      description:
        'Hit the ball near the end of your paddle to send it away at a sharp angle; hit it flush in the centre for a flat return.',
    },
    {
      title: 'Survive the acceleration',
      description:
        'The ball gets faster the longer a rally runs, so the point usually goes to whoever adjusts first.',
    },
  ],
  rules: [
    {
      title: 'A miss concedes a point',
      description:
        'If the ball passes your paddle and reaches your edge of the court, your opponent scores.',
    },
    {
      title: 'Angle follows contact',
      description:
        'The ball\u2019s rebound angle depends on where it strikes the paddle, not just on its incoming direction.',
    },
    {
      title: 'Rallies accelerate',
      description: 'Ball speed increases as a rally continues, resetting after each point.',
    },
    {
      title: 'Walls bounce, paddles decide',
      description:
        'The top and bottom edges reflect the ball cleanly. Only the left and right edges score.',
    },
  ],
  controls: [
    { key: 'W / S', action: 'Player 1 paddle up / down' },
    { key: '↑ / ↓', action: 'Player 2 paddle up / down' },
    { key: 'Space', action: 'Serve / pause' },
    { key: 'R', action: 'Restart match' },
  ],
  tips: [
    'Return to the centre between hits. A paddle parked in the middle of the court can reach either extreme in time.',
    'Use the paddle edges deliberately. A steep return buys you the recovery time a flat one does not.',
    'Watch the ball, not your opponent. In a fast rally the angle off their paddle tells you everything a moment earlier.',
    'Against the AI, alternate steep and flat returns. A predictable angle is the easiest thing in the world to track.',
  ],
  faq: [
    {
      question: 'Can two people play Pong on one keyboard?',
      answer:
        'Yes. Player 1 uses W and S while player 2 uses the up and down arrow keys on the same device.',
    },
    {
      question: 'Is there a single-player mode?',
      answer: 'Yes. You can play against the AI paddle on your own.',
    },
    {
      question: 'Does the ball get faster?',
      answer: 'Yes. Ball speed increases through a rally and resets when a point is scored.',
    },
    {
      question: 'Do I need to download anything?',
      answer: 'No. Pong runs directly in the browser with no install or account.',
    },
  ],
};
