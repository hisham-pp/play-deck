import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const ludoGame = defineGameModule({
  id: 'ludo',
  name: 'Ludo',
  description:
    'Classic board race for 2 to 6 players featuring 3D physics dice, AI bot personalities, and custom rule configurations.',
  category: GameCategories.B,
  players: getPCount(2, 6),
  releaseDate: '2026-09-12',
  tags: [GameTags.B, GameTags.DICE, GameTags.TD, GameTags.PH, GameTags.PLAYERS_2_6, GameTags.BOTS],
  featured: true,
  seo: {
    title: 'Play Ludo Online Free — 2 to 6 Players with Bots',
    description:
      'Play Ludo free in your browser for 2 to 6 players. Physics-driven 3D dice, AI bot personalities, custom house rules and local pass-and-play.',
    keywords: [
      'ludo online',
      'play ludo free',
      'ludo 6 player',
      'ludo with bots',
      'ludo board game online',
      'ludo no download',
    ],
  },
  tagline:
    'Classic board race for 2 to 6 players, with 3D physics dice and bots that play like people.',
  overview: [
    'Ludo is the race game descended from pachisi: four tokens per player, a shared circular track, and a die that decides everything. Get all your tokens from your yard around the board and into your home column before anyone else does.',
    'This version seats two to six players and rolls a genuine 3D physics die rather than a random number with an animation over it. AI bots come with distinct personalities — some hunt captures, some play it safe — and the rule set is configurable, so you can turn the house rules you grew up with on or off.',
  ],
  howToPlay: [
    {
      title: 'Roll to leave the yard',
      description:
        'Tokens start in your yard. Roll a six to move one onto the track and begin its lap.',
    },
    {
      title: 'Move a token',
      description:
        'Each roll moves one token that many squares along the track. Pick which token benefits most.',
    },
    {
      title: 'Capture rivals',
      description:
        'Land exactly on a square occupied by a single opposing token and it goes back to its owner’s yard.',
    },
    {
      title: 'Use safe squares',
      description:
        'Starred squares protect whatever sits on them, so park there when a rival is within striking range.',
    },
    {
      title: 'Come home',
      description:
        'Complete the lap and climb your home column. Every token must land home by exact count to win.',
    },
  ],
  rules: [
    {
      title: 'Sixes unlock and repeat',
      description:
        'A six is needed to bring a token out of the yard, and rolling one earns you another roll.',
    },
    {
      title: 'Captures send tokens home',
      description:
        'Landing on a lone enemy token returns it to its yard, and it must roll a six to re-enter.',
    },
    {
      title: 'Safe squares block capture',
      description: 'Tokens standing on a starred safe square cannot be captured.',
    },
    {
      title: 'Exact count to finish',
      description:
        'A token can only enter its final home slot on an exact roll. An over-count forfeits the move.',
    },
    {
      title: 'Configurable house rules',
      description:
        'Optional rules can be switched on or off before the game so the board matches how you have always played.',
    },
  ],
  controls: [
    {
      key: 'Click / tap die',
      action: 'Roll the 3D physics die',
    },
    {
      key: 'Click / tap token',
      action: 'Move the selected token',
    },
    {
      key: 'Drag',
      action: 'Orbit the board camera',
    },
  ],
  tips: [
    'Bring tokens out early. One token on the track is a target; three tokens on the track give you a choice on every roll.',
    'Spread your tokens rather than stacking them — bunched tokens waste rolls because only one can move at a time.',
    'Count the danger zone. Any rival token one to six squares behind yours can capture it on their next roll.',
    'Prioritise captures near your opponent’s home column. Sending a token back from there costs them an entire lap.',
    'Hold a token just short of home as a blocker rather than rushing it in, unless the exact count is available now.',
  ],
  faq: [
    {
      question: 'How many players can play Ludo here?',
      answer: 'Anywhere from two to six players, filling empty seats with AI bots if you want.',
    },
    {
      question: 'Are the dice actually random?',
      answer:
        'The die is simulated with 3D physics and tumbles to a result, rather than picking a number and animating to it.',
    },
    {
      question: 'Can I change the rules?',
      answer:
        'Yes. Several common house rules are configurable before the game starts so the board matches how you play.',
    },
    {
      question: 'Do the bots play differently from each other?',
      answer:
        'Yes. Bots have distinct personalities — some prioritise captures aggressively while others play a safer race.',
    },
  ],
});

export const ludoContent = ludoGame.content;
export const ludoDefinition = ludoGame.definition;
