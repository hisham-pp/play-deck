import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameControlKeys } from '../enums/controls.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const dontPopItGame = defineGameModule({
  id: 'dont-pop-it',
  name: "Don't Pop It",
  description:
    'Multiplayer push-your-luck strategy game where players take turns uncovering mystery tiles while dodging hidden pop hazards. Collect shields, bonus gems, and multipliers.',
  category: GameCategories.S,
  players: getPCount(1, 4),
  releaseDate: GameReleaseDates.D_2026_09_24,
  tags: [GameTags.LP, GameTags.AI, GameTags.M_P, GameTags.V_C, GameTags.TB],
  seo: {
    title: "Don't Pop It — Tile Strategy Game | PlayDeck",
    description:
      "Flip mystery tiles, bank bonus points, and survive rising pressure without bursting the balloon in Don't Pop It on PlayDeck.",
    keywords: [
      "don't pop it",
      'tile strategy game',
      'push your luck game',
      'balloon pop game',
      'party board game',
      'multiplayer tile game',
      'browser strategy game',
    ],
  },
  tagline: 'Test your nerve, reveal mystery tiles, and do not pop the balloon.',
  overview: [
    "Don't Pop It is a high-stakes, push-your-luck strategy game where players take turns uncovering mystery tiles from a tense grid while trying to avoid the hidden pop hazards.",
    'Every safe tile awards points, bonus crystals boost your standing, and kinetic shields protect you from sudden disaster. But as the board empties, the balloon pressure meter spikes and every choice becomes heart-pounding.',
    'Play solo against the tactical Pop-Bot 3000 or challenge friends in local pass-and-play matches across multi-round tournaments to crown the ultimate survivor.',
  ],
  howToPlay: [
    {
      title: 'Pick a game mode',
      description:
        'Choose Solo vs Pop-Bot to challenge smart AI or Pass & Play to battle with friends locally.',
    },
    {
      title: 'Select a mystery tile',
      description:
        'Tap any unrevealed tile or navigate using arrow keys and press Enter to flip it open.',
    },
    {
      title: 'Collect power-ups and score',
      description:
        'Safe tiles yield points, bonus gems award large payouts, and shields save you from one pop trap.',
    },
    {
      title: 'Survive the round',
      description:
        'Avoid triggering the pop hazard. The last player standing in the round claims a 50-point survival bonus.',
    },
  ],
  rules: [
    {
      title: 'Turn-based tile selection',
      description:
        'Players alternate picking one hidden tile per turn unless an extra-turn tile is uncovered.',
    },
    {
      title: 'Pop hazards trigger elimination',
      description:
        'Hitting a pop tile without a shield eliminates you from the active round immediately.',
    },
    {
      title: 'Shields offer one-time immunity',
      description:
        'Holding a kinetic shield shatters upon hitting a pop tile, keeping you alive in the round.',
    },
    {
      title: 'Multi-round tournament scoring',
      description:
        'Scores accumulate across all rounds. The player with the highest total score at the end wins the match.',
    },
  ],
  controls: [
    {
      key: GameControlKeys.CLICK_TAP,
      action: 'Select and flip open a mystery tile.',
    },
    {
      key: GameControlKeys.ARROWS,
      action: 'Navigate grid focus across rows and columns.',
    },
    {
      key: GameControlKeys.ENTER_SPACE,
      action: 'Activate the currently focused tile.',
    },
  ],
  tips: [
    'Deploy Radar tiles early to spot adjacent hazards and plan safe routes.',
    'Hold onto your Kinetic Shield—it is your only lifeline when balloon tension enters the red zone.',
    'Keep an eye on the Pressure Gauge: as fewer tiles remain, the odds of a pop increase drastically.',
  ],
  faq: [
    {
      question: "Can I play Don't Pop It by myself?",
      answer:
        'Yes, Solo vs Bot mode lets you play directly against the AI, which balances risk-reward tile picks.',
    },
    {
      question: 'What happens if all safe tiles are cleared?',
      answer:
        'The round completes automatically with bonus points awarded, advancing to the next tournament round.',
    },
    {
      question: 'Does the game support keyboard play?',
      answer:
        'Yes, the full grid can be navigated with arrow keys and confirmed using Space or Enter.',
    },
  ],
});

export const dontPopItContent = dontPopItGame.content;
export const dontPopItDefinition = dontPopItGame.definition;
