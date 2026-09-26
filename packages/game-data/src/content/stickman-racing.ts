import { defineGameModule } from '../core/base-game';
import { GameCategories, GameControlKeys, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const stickmanRacingGame = defineGameModule({
  id: 'stickman-racing',
  description:
    'Fast-paced arcade sprint gauntlet with hurdle leaps, slipstream speed boosts, and hazard lane evasion.',
  category: GameCategories.A,
  players: getPCount(1, 2),
  releaseDate: GameReleaseDates.D_2026_09_26,
  tags: [GameTags.ACT, GameTags.RACING, GameTags.SPEED, GameTags.REFLEXES, GameTags.HS],
  subtype: 'racing',
  difficultyPresets: ['easy', 'normal', 'hard'],
  seo: {
    title: 'Stickman Racing — Arcade Sprint & Hurdle Gauntlet | PlayDeck',
    description:
      'Dash through 3 lanes of high-speed hurdles, draft rival runners for slipstream boosts, and claim the championship trophy in Stickman Racing.',
    keywords: [
      'stickman racing',
      'arcade sprint game',
      'hurdle race game',
      'track and field browser game',
      'lane runner game',
      'slipstream racing',
      'speed gauntlet',
    ],
  },
  tagline: 'Switch lanes, time hurdle clearances, and draft your rivals for supersonic bursts.',
  overview: [
    'Stickman Racing is an electrifying multi-lane sprint showdown where lightning-fast lane changes and precision hurdle leaps decide the podium.',
    'Compete across three tactical running lanes, dodging barriers and drafting directly behind CPU rivals to build slipstream turbo charges.',
    'Unleash stored nitrous boosts at the perfect moment to slingshot past the pack and cross the checkered finish line in record-breaking times.',
  ],
  howToPlay: [
    {
      title: 'Shift lanes',
      description:
        'Press A/D or Left/Right Arrow keys (or swipe horizontally) to quickly switch between Left, Center, and Right lanes.',
    },
    {
      title: 'Leap hurdles',
      description:
        'Press Space, W, or Up Arrow to jump cleanly over approaching hurdles and maintain your sprint speed.',
    },
    {
      title: 'Draft for slipstream',
      description:
        'Run directly behind leading opponents to draft in their slipstream, rapidly charging your turbo meter.',
    },
    {
      title: 'Trigger turbo sprint',
      description:
        'Hold Shift or tap the on-screen Turbo button when your meter is charged to surge ahead at supersonic velocity.',
    },
  ],
  rules: [
    {
      title: 'Hurdle stumble penalty',
      description:
        'Clipping into a hurdle stumbles your runner, slashing your velocity and draining all accumulated slipstream energy.',
    },
    {
      title: 'Three-lane tactical field',
      description:
        'Hurdles and hazard cones spawn across varied lane configurations, requiring rapid lane changes to stay in the clear.',
    },
    {
      title: 'Race distances',
      description:
        'Sprint events range from 200m lightning dashes to grueling 800m obstacle marathons with escalating rival pace.',
    },
    {
      title: 'Podium awards',
      description:
        'Finishing in 1st place awards maximum championship points and unlocks higher difficulty racing leagues.',
    },
  ],
  controls: [
    {
      key: GameControlKeys.LEFT_RIGHT,
      action: 'Shift between lanes 1, 2, and 3',
    },
    {
      key: 'Space / W / Up Arrow',
      action: 'Jump over track hurdles and barriers',
    },
    {
      key: 'Shift / Turbo Button',
      action: 'Activate high-speed slipstream boost',
    },
    {
      key: 'P / Escape',
      action: 'Pause / Resume current race',
    },
  ],
  tips: [
    'Drafting directly behind a rival runner fills your boost gauge three times faster than running in empty lanes.',
    'Save your turbo boost for the final 50 meters of the sprint to overtake lead opponents right at the wire.',
    'Time your hurdle jumps early—jumping too late increases the chance of clipping the back edge of the barrier.',
    'Keep an eye on the mini-track progress bar at the top of the HUD to gauge upcoming hurdle density.',
  ],
  faq: [
    {
      question: 'How do I unlock turbo boosts?',
      answer:
        'Clear hurdles cleanly and run in the slipstream draft wake of rival runners to fill your yellow nitro gauge.',
    },
    {
      question: 'Can I play Stickman Racing with touch controls?',
      answer:
        'Yes! On-screen left/right lane buttons, a hurdle jump pad, and a tactile turbo button provide seamless mobile gameplay.',
    },
    {
      question: 'Are my best race times saved?',
      answer:
        'Yes! All personal records, podium finishes, and top speeds are automatically preserved in your PlayDeck profile.',
    },
  ],
});

export const stickmanRacingContent = stickmanRacingGame.content;
export const stickmanRacingDefinition = stickmanRacingGame.definition;
