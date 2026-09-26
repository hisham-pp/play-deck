import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const towerBuilderGame = defineGameModule({
  id: 'tower-builder',
  name: 'Tower Builder',
  description:
    'Competitive physics-based skyscraper construction game. Time swinging crane releases, stack diverse blocks with center-of-mass balance, and reach high into the stratosphere.',
  category: GameCategories.A,
  players: getPCount(1, 4),
  releaseDate: '2026-09-24',
  tags: [GameTags.A, GameTags.PH, GameTags.HS, GameTags.S, GameTags.LP],
  featured: true,
  seo: {
    title: 'Tower Builder — Physics Stacking Game | PlayDeck',
    description:
      'Stack physics blocks, master balance and momentum, and build towering skyscrapers into the stratosphere in Tower Builder on PlayDeck.',
    keywords: [
      'tower builder',
      'physics stacking game',
      'arcade tower builder',
      'block stacking game',
      'balance game',
      'browser tower game',
      'crane drop game',
    ],
  },
  tagline: 'Balance physics, time the crane release, and reach the stratosphere.',
  overview: [
    'Tower Builder is an arcade physics stacking game where players control a moving crane to construct the tallest skyscraper possible without triggering a catastrophic collapse.',
    'Every material brings distinct physical behavior—from heavy titanium blocks and wide safety platforms to bouncy rubber buffers and narrow pillars. Precision drops trigger combo streaks for soaring scores.',
    'As your tower pierces the clouds, altitude shifts the atmospheric backdrop and heightens the stakes. Keep your nerve, balance the center of mass, and build your way into legend.',
  ],
  howToPlay: [
    {
      title: 'Guide the moving crane',
      description:
        'Observe the swinging crane trolley as it oscillates across the construction site.',
    },
    {
      title: 'Time your block drop',
      description:
        'Press Space, tap the screen, or click Release to drop the active piece onto the tower foundation.',
    },
    {
      title: 'Chain perfect alignments',
      description:
        'Landing directly on the center of the underlying block awards Perfect Drops and escalates your combo multiplier.',
    },
    {
      title: 'Protect your three lives',
      description:
        'Dropping too far off center causes blocks to tumble off into the abyss, deducting one life from your team.',
    },
  ],
  rules: [
    {
      title: 'Realistic gravity and momentum',
      description:
        'Blocks inherit trolley velocity when released, requiring forward timing on fast swings.',
    },
    {
      title: 'Center of mass tolerance',
      description:
        'Blocks must overlap sufficiently with the top surface of the tower to settle stably.',
    },
    {
      title: 'Combo multiplier scoring',
      description:
        'Consecutive perfect alignments multiply points earned for each successive block placed.',
    },
    {
      title: 'Three strikes collapse condition',
      description:
        'Losing three blocks ends the construction run and records your peak tower altitude.',
    },
  ],
  controls: [
    {
      key: 'Click / Tap / Space',
      action: 'Release active construction block from the crane.',
    },
    {
      key: 'Arrow Keys / A & D',
      action: 'Nudge and steer crane trolley horizontally.',
    },
    {
      key: 'R Key',
      action: 'Quickly restart construction with a fresh foundation.',
    },
  ],
  tips: [
    'Wide platforms are valuable rest points that broaden your target for smaller future blocks.',
    'Do not hesitate too long on fast crane passes—anticipate the center alignment half a second early.',
    'Use titanium blocks low on the stack to maintain a heavy, stable gravitational base.',
  ],
  faq: [
    {
      question: 'Does the game end when a block falls off?',
      answer:
        'You have three lives per run. Falling blocks deduct one life, allowing you to recover your tower.',
    },
    {
      question: 'How is tower altitude measured?',
      answer:
        'Height is tracked in meters and updates dynamically as the camera tracks upward past skyscrapers and clouds.',
    },
    {
      question: 'Can I play with touch controls on mobile?',
      answer:
        'Yes, you can tap anywhere on the canvas or press the large Release Block button on mobile displays.',
    },
  ],
});

export const towerBuilderContent = towerBuilderGame.content;
export const towerBuilderDefinition = towerBuilderGame.definition;
