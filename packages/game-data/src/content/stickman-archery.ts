import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const stickmanArcheryGame = defineGameModule({
  id: 'stickman-archery',
  description:
    'Draw your bow, calculate crosswinds, and hit high-scoring bullseyes in this physics archery challenge.',
  category: GameCategories.A,
  players: getPCount(1),
  releaseDate: '2026-09-24',
  tags: [GameTags.ACT, GameTags.PH, GameTags.BOW, GameTags.AIM, GameTags.HS],
  seo: {
    title: 'Stickman Archery — Bow & Arrow Physics Game | PlayDeck',
    description:
      'Draw your bow, master crosswinds, aim for bullseyes, and conquer escalating target challenges in Stickman Archery on PlayDeck.',
    keywords: [
      'stickman archery',
      'bow and arrow game',
      'physics archery',
      'target shooting game',
      'browser archery',
      'arcade bow game',
    ],
  },
  tagline: 'Draw the string, read the wind, and strike the bullseye.',
  overview: [
    'Stickman Archery is an authentic physics-based bow and arrow simulator where players face challenging targets across variable crosswinds and shifting distances.',
    'Carefully drag to calibrate angle and draw strength, anticipate wind drift and gravity drop, and release to send arrows whistling down the shooting range.',
    'Progress through five distinct rounds featuring moving targets and high-velocity wind gauntlets. Build consecutive bullseye streaks to rack up arcade high scores.',
  ],
  howToPlay: [
    {
      title: 'Aim and draw',
      description:
        'Click or touch near your archer and drag backward to aim the bow and build launch power.',
    },
    {
      title: 'Read the wind',
      description:
        'Check the wind vane at the top of the range to adjust your aim against lateral air currents.',
    },
    {
      title: 'Release to loose',
      description:
        'Release your pointer or finger to loose the arrow along its calculated ballistic arc.',
    },
    {
      title: 'Score points',
      description:
        'Hit red bullseyes for 50 points, inner rings for 25 points, and outer rings for 10 points.',
    },
  ],
  rules: [
    {
      title: 'Limited quiver',
      description:
        'Each round provides a fixed number of arrows. Clear the target score before exhausting your quiver.',
    },
    {
      title: 'Bullseye combo multipliers',
      description:
        'Striking consecutive bullseyes stacks an escalating combo bonus onto your total score.',
    },
    {
      title: 'Dynamic wind conditions',
      description:
        'Higher rounds introduce unpredictable crosswinds that bend arrow trajectories mid-flight.',
    },
    {
      title: 'Moving targets',
      description:
        'Advanced rounds feature vertically oscillating targets requiring predictive lead aiming.',
    },
  ],
  controls: [
    {
      key: 'Mouse Drag / Touch Drag',
      action: 'Aim bow angle and adjust pull tension',
    },
    {
      key: 'Release Drag',
      action: 'Loose arrow toward target',
    },
    {
      key: 'Next Shot Button',
      action: 'Load the next arrow onto your bowstring',
    },
    {
      key: 'Restart Button',
      action: 'Reset your archery challenge from round 1',
    },
  ],
  tips: [
    'Observe the trajectory guide dots closely to gauge how gravity will pull down the arrow at long range.',
    'When shooting against headwind or crosswind, compensate by aiming slightly ahead of the wind direction.',
    'For vertically moving targets, time your shot so the target moves into your arrow path rather than aiming directly at it.',
    'Bullseye combos yield massive score spikes—take extra time on each draw to secure center hits.',
  ],
  faq: [
    {
      question: 'How does wind affect arrow flight?',
      answer:
        'Wind pushes arrows left or right continuously throughout their trajectory, proportional to wind speed.',
    },
    {
      question: 'Can I play Stickman Archery on mobile devices?',
      answer:
        'Yes. Touch drag and release controls provide a natural and tactile archery experience on touchscreens.',
    },
    {
      question: 'How many rounds are in the game?',
      answer:
        'The game features 5 progressively demanding rounds culminating in the high-wind Master Spire stage.',
    },
  ],
});

export const stickmanArcheryContent = stickmanArcheryGame.content;
export const stickmanArcheryDefinition = stickmanArcheryGame.definition;
