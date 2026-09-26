import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const miniGolfGame = defineGameModule({
  id: 'mini-golf',
  description:
    'Polished 2D physics mini golf with drag-to-aim putting, 18 championship holes, banking cushions, portals, online multiplayer, and integrated voice chat.',
  category: GameCategories.A,
  players: getPCount(1, 4),
  releaseDate: GameReleaseDates.D_2026_09_18,
  tags: [
    GameTags.A,
    GameTags.PH,
    GameTags.LP,
    GameTags.S,
    GameTags.M_P,
    GameTags.V_C,
    GameTags.ONLINE_MULTIPLAYER,
  ],
  seo: {
    title: 'Play Mini Golf Online Free — 2D Physics Arcade Game',
    description:
      'Putt through 18 handcrafted championship mini golf holes with 2D ball physics, bank shots, portals, online multiplayer, and real-time voice chat.',
    keywords: [
      'mini golf online',
      'play mini golf free',
      '2d mini golf',
      'arcade golf game',
      'physics golf game',
      'multiplayer mini golf',
      'browser mini golf',
    ],
  },
  tagline: 'Line up your angle, master the bank shots, and sink the birdie.',
  overview: [
    'Mini Golf brings classic arcade putting greens into PlayDeck with realistic 2D physics. Navigate 18 handcrafted championship holes loaded with elevation changes, sand traps, water hazards, pinball bumpers, portals, speed boosters, and kinetic obstacles.',
    'Drag to aim your putter and dial in the perfect shot power. Play solo against smart AI rivals, pass and play locally, or create private online rooms to compete with friends across the Front 9, Back 9, or Full 18 with built-in voice chat.',
  ],
  howToPlay: [
    {
      title: 'Drag to aim and gauge power',
      description:
        'Click or touch and drag away from the ball to set shot direction and power with live trajectory preview.',
    },
    {
      title: 'Read the course terrain',
      description:
        'Fairways roll true, sand traps heavily slow the ball down, and water hazards carry a one-stroke penalty drop.',
    },
    {
      title: 'Bank off walls and bumpers',
      description:
        'Use cushion walls for angled ricochets and energetic pinball bumpers to shortcut around difficult obstacles.',
    },
    {
      title: 'Sink the ball in the cup',
      description:
        'Slow down near the hole cup to let gravity catch the ball. Moving too quickly will cause a harsh lip-out.',
    },
  ],
  rules: [
    {
      title: 'Standard golf par scoring',
      description:
        'Score under par for bonuses: Ace (1 shot), Eagle (-2), Birdie (-1), Par (Even), Bogey (+1), Double Bogey (+2).',
    },
    {
      title: 'Turn-based rotation',
      description:
        'In multiplayer and vs AI modes, golfers alternate turns once each active ball comes to a complete rest.',
    },
    {
      title: 'Hazard penalties',
      description:
        'Hitting water or going out of bounds adds a 1-stroke penalty and resets the ball to the last safe lie.',
    },
    {
      title: 'Max stroke limit',
      description:
        'To keep the match moving, each hole has a maximum limit of par + 5 strokes before auto-picking up.',
    },
  ],
  controls: [
    {
      key: 'Mouse Drag & Release',
      action: 'Aim direction and set stroke power',
    },
    {
      key: 'Touch Drag & Release',
      action: 'Mobile putting gesture',
    },
    {
      key: 'Arrow Keys / A, D',
      action: 'Fine-tune aim angle',
    },
    {
      key: 'Space (Hold & Release)',
      action: 'Charge putt power and shoot',
    },
    {
      key: 'F',
      action: 'Toggle full screen mode',
    },
    {
      key: 'R',
      action: 'Reset ball to tee (practice)',
    },
  ],
  tips: [
    'Gentle putts are safer near the pin. Blasting a shot near the cup will lip-out over the rim.',
    'Use wall banking geometry. You can bypass tricky central obstacles by banking off side cushions at a 45-degree angle.',
    'Steer clear of deep sand bunkers unless you have high power to punch through the heavy deceleration.',
    'Watch the moving windmill blades and sweepers to time your putt through the open window.',
  ],
  faq: [
    {
      question: 'Is Mini Golf free to play online?',
      answer:
        'Yes. Mini Golf is completely free with no downloads, subscriptions, or installations required.',
    },
    {
      question: 'Can I play with friends locally?',
      answer:
        'Yes! The game features a Pass & Play local multiplayer mode supporting 2 to 4 players with individual ball colors and scorecards.',
    },
    {
      question: 'Does the game work on mobile touch devices?',
      answer:
        'Yes. Mini Golf includes responsive touch controls where you can drag directly behind the ball on any phone or tablet.',
    },
    {
      question: 'Are high scores and best rounds saved?',
      answer:
        'Yes. Your lowest stroke counts, career holes-in-one, and round records are automatically persisted in local browser storage.',
    },
  ],
});

export const miniGolfContent = miniGolfGame.content;
export const miniGolfDefinition = miniGolfGame.definition;
