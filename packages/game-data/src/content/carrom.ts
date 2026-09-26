import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const carromGame = defineGameModule({
  id: 'carrom',
  description:
    'Play classic 2D Carrom on PlayDeck. Flick the striker, pot white and black coins, master bank shots, and cover the Queen in solo vs AI or local 2-player matches.',
  category: GameCategories.B,
  players: getPCount(1, 4),
  releaseDate: '2026-09-25',
  tags: [GameTags.C, GameTags.PH, GameTags.S, GameTags.LP, GameTags.AI],
  seo: {
    title: 'Carrom — 2D Physics Board Game | PlayDeck',
    description:
      'Play classic 2D Carrom on PlayDeck. Flick the striker, pot white and black coins, master bank shots, and cover the Queen in solo vs AI or local 2-player matches.',
    keywords: [
      'carrom',
      'carrom board game',
      'carrom online',
      'tabletop physics game',
      'carrom vs ai',
      'multiplayer carrom',
      '2d physics board game',
      'carrom pocket game',
      'queen cover carrom',
    ],
  },
  tagline: 'Position your striker, calculate the angle, and clear the board.',
  overview: [
    'Carrom is an iconic tabletop strike-and-pocket game played on a polished wooden square board with smooth carrom men and an acrylic striker.',
    'Carefully position your striker along your baseline, dial in the shot power, and flick with pinpoint accuracy to pot white and black coins into the four corner pockets.',
    'Play against calibrated AI bots across Easy, Medium, and Hard difficulty levels, practice your bank shots in Solo mode, or enjoy pass-and-play matches with friends.',
  ],
  howToPlay: [
    {
      title: 'Position your striker',
      description:
        'Slide your striker along the designated baseline until you find the best line of sight toward your target coins.',
    },
    {
      title: 'Aim and calibrate power',
      description:
        'Rotate the aim trajectory guide to line up direct cuts or bank shots off the wooden cushions, then adjust your strike impulse.',
    },
    {
      title: 'Pocket your assigned coins',
      description:
        'Player 1 shoots white coins while Player 2 or the AI aims for black coins. Sinking your own coin grants an extra turn!',
    },
    {
      title: 'Cover the Red Queen',
      description:
        'Pot the prized Red Queen at any time, but remember you must pot one of your own coins on the same or next shot to cover it.',
    },
  ],
  rules: [
    {
      title: 'Turn continuity',
      description:
        'Potting at least one of your own coins grants an immediate extra turn. A shot that pockets no coins passes the turn to your opponent.',
    },
    {
      title: 'Queen cover rule',
      description:
        'If the Queen is pocketed, it must be covered by pocketing another coin of your color on the same turn or immediate next shot. Otherwise, the Queen returns to the center circle.',
    },
    {
      title: 'Striker foul penalty',
      description:
        'Accidentally potting the striker constitutes a foul. One of your previously pocketed coins returns to the center as a penalty, and your turn ends immediately.',
    },
    {
      title: 'Winning score',
      description:
        'The round concludes when either player pockets all of their assigned coins. The winner scores points equal to remaining opponent coins plus Queen bonus.',
    },
  ],
  controls: [
    {
      key: 'Left / Right Arrow Keys',
      action: 'Slide striker along baseline bounds',
    },
    {
      key: 'A / D Keys',
      action: 'Adjust shot angle trajectory',
    },
    {
      key: 'W / S Keys',
      action: 'Increase or decrease shot power impulse',
    },
    {
      key: 'Spacebar / Strike Button',
      action: 'Flick striker onto the carrom board',
    },
    {
      key: 'Mouse / Touch Drag',
      action: 'Drag striker along baseline or drag to aim and pull shot power',
    },
  ],
  tips: [
    'Use cushion rebounds when opponent coins block a direct line of sight to corner pockets.',
    'Always set up an easy follow-up coin before pocketing the Queen so you can safely cover it.',
    'Avoid overly aggressive shots that risk pocketing the striker into a corner hole.',
    'Thin cut shots allow you to redirect coins at sharp angles while keeping the striker in safe territory.',
  ],
  faq: [
    {
      question: 'What is the difference between Classic and Blitz setups?',
      answer:
        'Classic setup includes 9 white coins, 9 black coins, and 1 Queen (19 coins). Blitz setup features 4 white, 4 black, and 1 Queen (9 coins) for fast-paced rounds.',
    },
    {
      question: 'Can I play Carrom with a friend on mobile or desktop?',
      answer:
        'Yes! The 2-Player Local Pass & Play mode allows two players to alternate turns seamlessly on the same screen.',
    },
    {
      question: 'What happens if I pot the opponent coin?',
      answer:
        'The pocketed coin counts toward your opponent score, and unless you also potted your own coin, your turn ends immediately.',
    },
  ],
});

export const carromContent = carromGame.content;
export const carromDefinition = carromGame.definition;
