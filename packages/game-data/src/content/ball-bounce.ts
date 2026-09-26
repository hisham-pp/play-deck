import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const ballBounceGame = defineGameModule({
  id: 'ball-bounce',
  name: 'Ball Bounce',
  description:
    'Steer the paddle, keep the ball alive, and smash through ever-tougher block layouts. Chain combos, grab power-ups, and chase your high score.',
  category: GameCategories.A,
  players: getPCount(1),
  releaseDate: '2026-09-17',
  tags: [
    GameTags.A,
    GameTags.S,
    GameTags.HS,
    GameTags.POWER_UPS,
    GameTags.TOUCH_READY,
    GameTags.KEYBOARD_READY,
  ],
  featured: true,
  seo: {
    title: 'Play Ball Bounce — Free Brick Breaker Arcade Game',
    description:
      'Play Ball Bounce free in your browser. Steer the paddle, smash through block layouts, chain combos and grab power-ups while chasing your high score.',
    keywords: [
      'brick breaker online',
      'breakout game free',
      'ball and paddle game',
      'block breaker browser game',
      'arcade brick breaker',
      'ball bounce game',
    ],
  },
  tagline: 'Steer the paddle, keep the ball alive, and smash through ever-tougher block layouts.',
  overview: [
    'Ball Bounce is a brick breaker in the Breakout lineage: a ball ricochets around a walled court, you slide a paddle along the bottom edge to keep it in play, and every block it touches breaks. Clear the layout to advance to a tougher one.',
    'Power-ups drop from certain blocks and change the run — wider paddles, multi-ball, and more. Combos reward clearing several blocks without touching the paddle, so an angle that keeps the ball trapped above the layout is worth far more than a safe vertical bounce. Your best score is stored locally between sessions.',
  ],
  howToPlay: [
    {
      title: 'Serve',
      description: 'Press Space, Enter, or tap the play area to launch the ball off the paddle.',
    },
    {
      title: 'Keep it alive',
      description:
        'Move the paddle left and right so the ball never reaches the floor. Losing it costs you a life.',
    },
    {
      title: 'Break the layout',
      description:
        'Every block the ball hits breaks and scores. Clear them all to move on to the next arrangement.',
    },
    {
      title: 'Grab power-ups',
      description:
        'Catch falling power-ups with the paddle to widen it, split the ball, or gain other advantages.',
    },
    {
      title: 'Chain combos',
      description:
        'Blocks broken in a single trip — before the ball returns to the paddle — chain into a multiplier.',
    },
  ],
  rules: [
    {
      title: 'The floor is fatal',
      description:
        'Letting the ball pass below the paddle costs a life. Run out of lives and the game ends.',
    },
    {
      title: 'Contact point steers the ball',
      description:
        'Where the ball strikes the paddle determines its outgoing angle, giving you full control of the rebound.',
    },
    {
      title: 'Clear to advance',
      description:
        'Breaking every block in a layout advances you to the next, tougher arrangement.',
    },
    {
      title: 'Combos need a clean trip',
      description:
        'A combo multiplier builds while the ball stays airborne and resets once it touches your paddle.',
    },
  ],
  controls: [
    {
      key: 'A / ←',
      action: 'Move paddle left',
    },
    {
      key: 'D / →',
      action: 'Move paddle right',
    },
    {
      key: 'Mouse / drag',
      action: 'Steer paddle directly',
    },
    {
      key: 'Space / Enter',
      action: 'Serve / launch ball',
    },
    {
      key: 'P / Esc',
      action: 'Pause / resume',
    },
  ],
  tips: [
    'Aim for the sides early. Getting the ball above the layout lets it bounce along the ceiling and clear rows unattended.',
    'Use the paddle edges to set steep angles, and the centre when you just need a safe, readable return.',
    'Do not chase every power-up. Abandoning a good ball position to catch a drop loses more than the drop is worth.',
    'With multi-ball active, play the ball nearest the floor and let the others work — trying to track all of them loses all of them.',
    'Mouse steering is faster than keyboard for tight saves, but keyboard gives more consistent angle control.',
  ],
  faq: [
    {
      question: 'What kind of game is Ball Bounce?',
      answer:
        'It is a brick breaker, in the Breakout and Arkanoid tradition: a paddle, a ball, and layouts of blocks to destroy.',
    },
    {
      question: 'Are there power-ups?',
      answer:
        'Yes. Certain blocks drop power-ups that you catch with the paddle to change the run in your favour.',
    },
    {
      question: 'Can I play it on a touchscreen?',
      answer: 'Yes. Drag anywhere in the play area to steer the paddle, and tap to serve.',
    },
    {
      question: 'Is my high score saved?',
      answer: 'Yes. Your best score is kept locally in your browser on that device.',
    },
  ],
});

export const ballBounceContent = ballBounceGame.content;
export const ballBounceDefinition = ballBounceGame.definition;
