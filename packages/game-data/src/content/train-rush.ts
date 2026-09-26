import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const trainRushGame = defineGameModule({
  id: 'train-rush',
  name: 'Train Rush',
  description:
    'Build and connect railway tracks from start to terminus in Train Rush on PlayDeck. Rotate pieces, bridge rivers, avoid boulders, and race rival rail barons.',
  category: GameCategories.S,
  players: getPCount(2, 6),
  releaseDate: '2026-09-25',
  tags: [GameTags.M_P, GameTags.S, GameTags.AI, GameTags.V_C, GameTags.PZ],
  featured: true,
  seo: {
    title: 'Train Rush — Competitive Railway Track Puzzle | PlayDeck',
    description:
      'Build and connect railway tracks from start to terminus in Train Rush on PlayDeck. Rotate pieces, bridge rivers, avoid boulders, and race rival rail barons.',
    keywords: [
      'train rush game',
      'railway puzzle game',
      'train track builder online',
      'competitive track puzzle',
      'pipe dream railroad game',
      'railbound style puzzle',
      'multiplayer train game',
      'playdeck train rush',
    ],
  },
  tagline: 'Rotate and lay tracks. Connect your start depot to the terminus station.',
  overview: [
    'Train Rush is a fast-paced railway puzzle duel where players race to construct a continuous, unbroken railroad line from the departure depot to the destination terminus.',
    'Each round, you receive random track pieces—straights, curves, T-junctions, crossroads, bridges, and passenger stations. Rotate and place pieces wisely to bypass water, boulders, and mountains.',
    'Earn massive bonuses for servicing passenger stations and engineering long, winding express routes before the dispatch clock runs out.',
  ],
  howToPlay: [
    {
      title: 'Inspect the landscape',
      description:
        'Survey your grid to locate your Start Depot, Destination Terminus, natural obstacles, and golden passenger stations.',
    },
    {
      title: 'Rotate and lay tracks',
      description:
        'Rotate your active track piece using R or Spacebar, then click any empty grid tile to lay down the rails.',
    },
    {
      title: 'Span rivers and navigate terrain',
      description:
        'Deploy specialized bridge pieces to span rushing canyon rivers, and steer your route clear of impassable mountain ridges.',
    },
    {
      title: 'Complete the express line',
      description:
        'Connect the final track into the destination terminus to sound the steam whistle, launch your locomotive, and score round victory points.',
    },
  ],
  rules: [
    {
      title: 'Directional rail alignment',
      description:
        'A track connection is valid only when adjacent track openings directly face each other without gaps or misalignments.',
    },
    {
      title: 'Obstacle restrictions',
      description:
        'Granite boulders and mountain peaks cannot be built upon. Water tiles require specialized bridge track pieces.',
    },
    {
      title: 'Passenger station bonuses',
      description:
        'Routing your train line through passenger stations adds significant bonus points to your round total.',
    },
    {
      title: 'Express completion bounty',
      description:
        'Successfully linking Start to Destination grants a major +500 point completion bonus plus additional points per connected track piece.',
    },
  ],
  controls: [
    {
      key: 'Click / Tap Tile',
      action: 'Place current track piece onto an empty grid cell',
    },
    {
      key: 'R / Spacebar',
      action: 'Rotate the currently held track piece clockwise by 90°',
    },
    {
      key: 'Z / Right-Click Tile',
      action: 'Undo or remove the last placed track piece',
    },
    {
      key: 'D / Tap Skip',
      action: 'Discard current piece for the next piece in the queue',
    },
  ],
  tips: [
    'Plan your route backwards from the destination as well as forwards from the start depot to meet in the middle.',
    'Do not hesitate to skip an awkward piece using the Discard button if it cannot help your immediate route.',
    'In Canyon Pass, identify the river crossing gap early to ensure your line hits the bridge slot cleanly.',
    'Going out of your way to visit golden passenger stations often earns more points than a direct short route.',
  ],
  faq: [
    {
      question: 'What happens if the timer runs out before I finish my route?',
      answer:
        'You still earn partial points based on the number of connected track pieces branching out from your start depot.',
    },
    {
      question: 'Can I replace or remove track pieces I placed earlier?',
      answer:
        'Yes! Right-click any cell or press Z / Undo to remove placed pieces and rebuild that segment.',
    },
    {
      question: 'Can I play solo against AI bot conductors?',
      answer:
        'Yes! You can race against 1 to 4 AI conductors (SteamBot, RailBaron, ConductorCasey, and ExpressElla) who build routes simultaneously.',
    },
  ],
});

export const trainRushContent = trainRushGame.content;
export const trainRushDefinition = trainRushGame.definition;
