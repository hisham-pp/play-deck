import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const snakeGame = defineGameModule({
  id: 'snake',
  name: 'Snake',
  description:
    'Guide the snake, eat energy pellets, and grow without crashing into walls or your own tail.',
  category: GameCategories.A,
  players: getPCount(1),
  releaseDate: '2026-09-11',
  tags: [GameTags.A, GameTags.C, GameTags.RETRO, GameTags.HS],
  seo: {
    title: 'Play Snake Online — Free Classic Arcade Game',
    description:
      'Play the classic Snake game free in your browser. Eat pellets, grow longer, and chase your high score. No download, no sign-up, works offline.',
    keywords: [
      'snake game',
      'play snake online',
      'classic snake',
      'free snake game',
      'snake game no download',
      'retro arcade snake',
    ],
  },
  tagline: 'Eat, grow, and survive — the arcade classic that never stopped being hard.',
  overview: [
    'Snake is the arcade staple that made its name on monochrome handsets and never lost its grip. You steer a constantly moving line around a walled arena, swallowing energy pellets that make you longer with every bite. The catch is that your own body becomes the obstacle course — the better you play, the less room you have to play in.',
    'PlayDeck runs Snake on a custom 2D canvas renderer with crisp motion and frame-accurate input, so a turn you buffer is a turn the snake actually makes. Scores are saved locally in your browser, which means your personal best survives a refresh and the game keeps working with the network switched off.',
  ],
  howToPlay: [
    {
      title: 'Start the run',
      description:
        'Launch a session and the snake begins moving immediately. There is no countdown — point it somewhere safe before you reach for a pellet.',
    },
    {
      title: 'Collect energy pellets',
      description:
        'Steer into the glowing pellet to score. A new pellet spawns at a random free cell the moment you eat one.',
    },
    {
      title: 'Grow without crashing',
      description:
        'Each pellet adds a segment to your tail. Hitting a wall or any part of your own body ends the run instantly.',
    },
    {
      title: 'Ride the speed curve',
      description:
        'The snake accelerates as your score climbs, so plan a route with escape room rather than chasing every pellet head-on.',
    },
  ],
  rules: [
    {
      title: 'Eat pellets',
      description:
        'Guide the snake to consume energy pellets to grow your length and increase your score.',
    },
    {
      title: 'Avoid collisions',
      description:
        'Do not collide with the perimeter boundaries or loop into your own body segments.',
    },
    {
      title: 'Speed progression',
      description: 'Snake velocity gradually increases as your score escalates.',
    },
    {
      title: 'No reverse',
      description:
        'You cannot turn 180 degrees into yourself — a direction directly opposite your current heading is ignored.',
    },
  ],
  controls: [
    {
      key: 'W / ↑',
      action: 'Move up',
    },
    {
      key: 'S / ↓',
      action: 'Move down',
    },
    {
      key: 'A / ←',
      action: 'Move left',
    },
    {
      key: 'D / →',
      action: 'Move right',
    },
    {
      key: 'Space',
      action: 'Pause / resume',
    },
    {
      key: 'R',
      action: 'Restart game',
    },
  ],
  tips: [
    'Hug the perimeter early. Eating along the outside wall keeps the middle of the board free for the long tail you will have later.',
    'Move in a boustrophedon — sweep the board in tight parallel lanes so your tail lies flat instead of crossing your own path.',
    'Never enter a pocket you cannot exit. Before turning into an enclosed area, check that the space is bigger than your current length.',
    'At high speed, commit to the turn one cell early. Input registers on the next tick, not the instant you press.',
  ],
  faq: [
    {
      question: 'Is Snake free to play on PlayDeck?',
      answer:
        'Yes. Snake is completely free, runs in your browser, and requires no download, install, or account.',
    },
    {
      question: 'Does Snake work on mobile?',
      answer:
        'Yes. The board scales to phone and tablet screens, and you can steer with swipe gestures as well as a keyboard.',
    },
    {
      question: 'Is my high score saved?',
      answer:
        'Your best score is stored locally in your own browser, so it survives a page refresh. It is never uploaded anywhere.',
    },
    {
      question: 'Can I play Snake offline?',
      answer:
        'Yes. Once the page has loaded, the game logic runs entirely on your device and keeps working without a connection.',
    },
  ],
});

export const snakeContent = snakeGame.content;
export const snakeDefinition = snakeGame.definition;
