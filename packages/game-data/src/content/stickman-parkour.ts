import { defineGameModule } from '../core/base-game';
import { GameCategories, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const stickmanParkourGame = defineGameModule({
  id: 'stickman-parkour',
  description:
    'High-speed rooftop freerunning, precision wall vaults, momentum chaining, and gap leaps across skyline obstacles.',
  category: GameCategories.A,
  players: getPCount(1),
  releaseDate: GameReleaseDates.D_2026_09_26,
  tags: [GameTags.ACT, GameTags.PARKOUR, GameTags.SR, GameTags.PRECISION, GameTags.HS],
  subtype: 'parkour',
  difficultyPresets: ['normal', 'hard', 'expert'],
  seo: {
    title: 'Stickman Parkour — Rooftop Freerunner Arcade | PlayDeck',
    description:
      'Vault rooftop obstacles, chain momentum wall jumps, slide under steel pipes, and set new speedrun records in Stickman Parkour on PlayDeck.',
    keywords: [
      'stickman parkour',
      'rooftop runner game',
      'freerunning arcade',
      'wall jump runner',
      'browser parkour game',
      'momentum runner',
      'speedrun platformer',
    ],
  },
  tagline: 'Chain momentum, conquer rooftop gaps, and master gravity-defying wall vaults.',
  overview: [
    'Stickman Parkour delivers high-octane rooftop freerunning where timing, momentum, and fluid reflexes dictate your survival across a neon skyline.',
    'Sprint across towering building tops, leap expansive alley gaps, vault neon facades with wall kicks, and slide beneath ventilation duct barriers.',
    'Build and maintain a maximum 3.0x momentum combo by sticking clean landing rolls and chaining obstacle vaults without losing forward stride.',
  ],
  howToPlay: [
    {
      title: 'Run and accelerate',
      description:
        'Use D or Right Arrow to sprint forward and gather kinetic speed across flat rooftop decks.',
    },
    {
      title: 'Jump and wall kick',
      description:
        'Press Space, W, or Up Arrow to leap over rooftop chasms, and tap jump again while contacting vertical walls to perform wall kicks.',
    },
    {
      title: 'Slide under hazards',
      description:
        'Press S or Down Arrow while sprinting to duck into a ground slide under low pipes, air ducts, and billboards.',
    },
    {
      title: 'Maintain momentum',
      description:
        'Landing smoothly without colliding into walls accelerates your speed and multiplies your distance score.',
    },
  ],
  rules: [
    {
      title: 'Abyssal alley drops',
      description:
        'Mistiming a leap across rooftop gaps results in falling into the street below, concluding your speedrun.',
    },
    {
      title: 'Momentum decay',
      description:
        'Crashing head-on into wall facades resets your accumulated momentum multiplier and temporarily stumbles your runner.',
    },
    {
      title: 'Speed booster gates',
      description:
        'Sprinting through glowing cyan acceleration gates instantly propels you to supersonic speeds with brief invulnerability.',
    },
    {
      title: 'Distance scoring',
      description:
        'Total score scales with distance traversed in meters, augmented by trick bonuses from wall kicks and slide tucks.',
    },
  ],
  controls: [
    {
      key: 'D / Right Arrow',
      action: 'Sprint forward / Accelerate',
    },
    {
      key: 'A / Left Arrow',
      action: 'Brake / Decelerate',
    },
    {
      key: 'Space / W / Up Arrow',
      action: 'Jump / Double Jump / Wall Kick',
    },
    {
      key: 'S / Down Arrow',
      action: 'Slide under low obstacles / Roll landing',
    },
  ],
  tips: [
    'Press jump right when you make contact with a wall facade to execute a high-altitude wall kick over the barrier.',
    'Hold slide right as you hit the ground after long drops to trigger a forward momentum roll rather than a hard stop.',
    'Look ahead at incoming rooftops to anticipate whether to slide under pipes or leap over chimneys.',
    'Speed booster pads allow you to clear extra-wide chasm gaps without needing mid-air double jumps.',
  ],
  faq: [
    {
      question: 'Can I perform wall jumps continuously?',
      answer:
        'You can perform one wall kick per vertical wall surface, propelling you diagonally upward and forward.',
    },
    {
      question: 'Is Stickman Parkour playable on mobile touchscreens?',
      answer:
        'Yes, dedicated on-screen jump and slide tactile buttons provide responsive controls for mobile devices.',
    },
    {
      question: 'Does the game save my longest distance?',
      answer:
        'Yes! Your furthest distance and best speedrun scores are recorded automatically to your PlayDeck profile.',
    },
  ],
});

export const stickmanParkourContent = stickmanParkourGame.content;
export const stickmanParkourDefinition = stickmanParkourGame.definition;
