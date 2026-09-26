import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const stickmanBasketballGame = defineGameModule({
  id: 'stickman-basketball',
  description:
    'Arcade streetball showdown with gravity basketball trajectory, ankle-breaking crossovers, and rim-rocking dunks.',
  category: GameCategories.A,
  players: getPCount(1, 2),
  releaseDate: GameReleaseDates.D_2026_09_26,
  tags: [GameTags.SPORTS, GameTags.A, GameTags.PH, GameTags.BASKETBALL, GameTags.HS],
  subtype: 'basketball',
  difficultyPresets: ['easy', 'normal', 'hard'],
  seo: {
    title: 'Stickman Basketball — Arcade Streetball Showdown | PlayDeck',
    description:
      'Drive the lane, execute ankle-breaking crossovers, master gravity jump shots, and throw down rim-rocking dunks in Stickman Basketball on PlayDeck.',
    keywords: [
      'stickman basketball',
      'arcade basketball game',
      'streetball showdown',
      'basketball dunk game',
      'browser basketball',
      'physics basketball game',
      'stickman sports arcade',
    ],
  },
  tagline:
    'Break ankles with swift crossovers, time your arc jump shots, and shatter rims with monster dunks.',
  overview: [
    'Stickman Basketball brings high-flying 2D arcade streetball action with snappy ball physics, dynamic shooting arcs, and electric fast breaks.',
    'Go one-on-one against crafty streetball legends or duel a friend in local versus mode. Dribble past defenders with crossover moves, elevate for clutch three-pointers, and soar for thunderous slam dunks.',
    'Read shot contest defense, time your release at the apex of your jump, and race against the shot clock to run the blacktop.',
  ],
  howToPlay: [
    {
      title: 'Dribble and crossover',
      description:
        'Use A/D or Arrow keys to drive toward the basket. Tap K or Shift to break ankles with quick direction crossovers.',
    },
    {
      title: 'Time your jump shot',
      description:
        'Hold Space or J to elevate into your shooting motion. Release right at the peak of your jump for a green-meter swish bonus.',
    },
    {
      title: 'High-flying slam dunks',
      description:
        'Drive inside the painted key while sprinting and hold the shoot button to take off into an acrobatic rim-rattling dunk.',
    },
    {
      title: 'Defense and steals',
      description:
        'Stay between your opponent and the rim. Press K to poke the ball loose or time your jump to swat shots out of the air.',
    },
  ],
  rules: [
    {
      title: 'Arcade scoring',
      description:
        'Inside shots and dunks count for 2 points. Shots launched from beyond the three-point arc award 3 points.',
    },
    {
      title: 'Shot clock pressure',
      description:
        'You have 14 seconds per possession to get a shot off; failing to hit the rim results in an immediate turnover.',
    },
    {
      title: 'Contest and defense',
      description:
        'Shooting while heavily contested lowers your accuracy percentage. Create separation with step-backs and dribble moves.',
    },
    {
      title: 'Timed streetball quarters',
      description:
        'Play through competitive 60-second showdown quarters. The team with the highest point total at the final buzzer claims the court.',
    },
  ],
  controls: [
    {
      key: 'A / D or Left / Right',
      action: 'Move / Drive Lane',
    },
    {
      key: 'Space / J',
      action: 'Jump / Shoot / Dunk (Hold & Release)',
    },
    {
      key: 'K / Shift',
      action: 'Crossover / Steal',
    },
    {
      key: 'W / Up Arrow',
      action: 'Contest / Block',
    },
  ],
  tips: [
    'Release the shot button when your stickman reaches maximum jump height for the highest shooting accuracy.',
    'If the defender is sagging off near the rim, step back behind the arc for an uncontested three-point attempt.',
    'Executing a crossover right as the defender lunges for a steal triggers an ankle-breaker stumble animation.',
    'Dunks cannot be blocked once your player reaches the rim apex — attack the basket aggressively on fast breaks.',
  ],
  faq: [
    {
      question: 'Can two players play locally on the same keyboard?',
      answer:
        'Yes! Stickman Basketball features local 2-Player Versus mode using split WASD and Arrow key controls.',
    },
    {
      question: 'How do green-release jump shots work?',
      answer:
        'Releasing your shot within 50 milliseconds of jump apex produces a perfect green release that guarantees a basket.',
    },
    {
      question: 'Are there different court environments?',
      answer:
        'You can hoop across multiple streetball venues, including Brooklyn Blacktop, Venice Beach Sunset, and Neon Metropolis.',
    },
  ],
});

export const stickmanBasketballContent = stickmanBasketballGame.content;
export const stickmanBasketballDefinition = stickmanBasketballGame.definition;
