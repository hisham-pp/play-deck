import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameControlKeys } from '../enums/controls.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const reactionArenaGame = defineGameModule({
  id: 'reaction-arena',
  description:
    'Fast reflex mini-game collection. Compete across rapid-fire trials testing reaction speed, color matching, mental arithmetic, and visual focus.',
  category: GameCategories.A,
  players: getPCount(1, 4),
  releaseDate: GameReleaseDates.D_2026_09_24,
  tags: [GameTags.A, GameTags.S, GameTags.LP, GameTags.HS, GameTags.AI],
  seo: {
    title: 'Reaction Arena — Fast Reflex Games | PlayDeck',
    description:
      'Challenge your visual reflexes, timing, and instincts across fast-paced mini-games in Reaction Arena on PlayDeck.',
    keywords: [
      'reaction arena',
      'reaction time game',
      'reflex mini games',
      'speed reaction challenge',
      'stroop test game',
      'browser reaction test',
      'quick reflex game',
    ],
  },
  tagline: 'Test your nerve, react on instinct, and prove your reflexes.',
  overview: [
    'Reaction Arena is a high-octane mini-game gauntlet where players compete across diverse reaction trials testing optical response, cognitive speed, and directional reflexes.',
    'From sudden lightning taps and Stroop color puzzles to rapid arithmetic and precision needle stops, each trial challenges a different neurological reflex path within tight millisecond windows.',
    'Face off solo against the calibrated Reflex-Bot or challenge local rivals in rapid duels to determine who holds true lightning-tier reaction times.',
  ],
  howToPlay: [
    {
      title: 'Observe the trial objective',
      description:
        'Each round starts with distinct instructions—watch carefully for false signals.',
    },
    {
      title: 'Wait for the go cue',
      description:
        'Never jump the gun on lightning trials. False starts incur time penalties or forfeit round points.',
    },
    {
      title: 'Execute instantly',
      description:
        'Tap the target, confirm the truth condition, or hit the matching arrow key with maximum velocity.',
    },
    {
      title: 'Review millisecond split times',
      description:
        'Track your response times in milliseconds and build high scores across five tournament rounds.',
    },
  ],
  rules: [
    {
      title: 'Millisecond timing measurement',
      description:
        'Score calculations combine correct evaluation with raw reaction speed under the timer limit.',
    },
    {
      title: 'False start prevention',
      description:
        'Triggering lightning tap trials before the green signal disqualifies the attempt.',
    },
    {
      title: 'Five rounds tournament scoring',
      description:
        'Points accumulate across all five diverse mini-challenges to determine final reflex standings.',
    },
    {
      title: 'Single-input confirmation',
      description: 'First registered input locks in your answer for that challenge trial.',
    },
  ],
  controls: [
    {
      key: 'Click / Tap / Space',
      action: 'Trigger lightning strike button or stop oscillating needle.',
    },
    {
      key: 'T / F Keys or Left / Right',
      action: 'Select True (Match) or False (Different) on cognitive trials.',
    },
    {
      key: GameControlKeys.ARROWS,
      action: 'Instantly execute direction targets (Up, Down, Left, Right).',
    },
  ],
  tips: [
    'On color trials, focus your vision on the ink color first rather than reading the letters silently.',
    'Keep your finger hovering closely over the strike pad during lightning challenges to shave off 50ms.',
    'Anticipate the needle bounce rhythm to catch the golden zone cleanly.',
  ],
  faq: [
    {
      question: 'What is considered a good reaction time?',
      answer:
        'Average human reaction is around 250ms to 300ms. Sub-200ms represents top esports-grade reflexes.',
    },
    {
      question: 'Are audio cues required to play?',
      answer:
        'No, all cues in Reaction Arena are fully visual and designed with high-contrast color indicators.',
    },
    {
      question: 'Can I play against an AI opponent?',
      answer:
        'Yes, Reflex-Bot simulates competitive human reaction profiles across each challenge type.',
    },
  ],
});

export const reactionArenaContent = reactionArenaGame.content;
export const reactionArenaDefinition = reactionArenaGame.definition;
