import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const platformRaceGame = defineGameModule({
  id: 'platform-race',
  description:
    'Race across neon obstacle courses in Platform Race on PlayDeck. Master moving platforms, spring launchers, and speed boosts to cross the finish line first.',
  category: GameCategories.A,
  players: getPCount(1, 4),
  releaseDate: GameReleaseDates.D_2026_09_25,
  tags: [GameTags.A, GameTags.PH, GameTags.S, GameTags.LP, GameTags.AI],
  seo: {
    title: 'Platform Race — 2D Speedrun Parkour | PlayDeck',
    description:
      'Race across neon obstacle courses in Platform Race on PlayDeck. Master moving platforms, spring launchers, and speed boosts to cross the finish line first.',
    keywords: [
      'platform race',
      'speedrun platformer',
      '2d racing game',
      'parkour browser game',
      'multiplayer platform race',
      'obstacle course speedrun',
      'arcade runner game',
      'neon platformer',
    ],
  },
  tagline: 'Time your jumps, ride moving ledges, and dash to the podium.',
  overview: [
    'Platform Race is an adrenaline-fueled 2D platform racing speedrun where split-second momentum and obstacle navigation determine who takes the podium.',
    'Sprint through challenging tracks packed with moving platforms, spring launchers, turbo boost pads, and bottomless hazard chasms.',
    'Test your parkour precision against rival AI speedrunners in Solo Grand Prix or battle head-to-head in local two-player duel mode on desktop and mobile devices.',
  ],
  howToPlay: [
    {
      title: 'Sprint toward the finish line',
      description:
        'Use horizontal controls to build running momentum across straightaways and floating stepping stones.',
    },
    {
      title: 'Chain double jumps',
      description:
        'Execute a ground jump and tap jump again in mid-air to clear wide gaps and ascend to higher elevated shortcuts.',
    },
    {
      title: 'Hit springs and boost pads',
      description:
        'Step onto golden spring pads for high vertical launches and ride green boost pads for blistering forward velocity.',
    },
    {
      title: 'Tag checkpoints',
      description:
        'Cross laser gate checkpoints to lock in your respawn coordinates if you stumble into hazard pits.',
    },
  ],
  rules: [
    {
      title: 'Checkpoint respawns',
      description:
        'Falling off the course or touching red hazard spikes immediately respawns your racer at your latest activated checkpoint.',
    },
    {
      title: 'Moving platform dynamics',
      description:
        'Platforms oscillate horizontally and vertically along the course; timing landings on shifting surfaces is essential.',
    },
    {
      title: 'Double jump recharge',
      description:
        'Double jump ability recharges automatically upon touching any solid platform, spring, or boost pad.',
    },
    {
      title: 'Podium placements',
      description:
        'Racers are ranked in order of finish line crossing, with split times measured in milliseconds.',
    },
  ],
  controls: [
    {
      key: 'A / D / Arrow Keys',
      action: 'Run left or right across the course for Player 1',
    },
    {
      key: 'Spacebar / W',
      action: 'Jump and mid-air double jump for Player 1',
    },
    {
      key: 'Arrow Keys + Enter / Up',
      action: 'Move and jump for Player 2 (Local 2-Player mode)',
    },
    {
      key: 'On-Screen Touch Buttons',
      action: 'Directional arrows and jump button for mobile touch screens',
    },
  ],
  tips: [
    'Save your second jump until you reach the apex of your first jump for maximum distance.',
    'Look out for high-speed upper routes accessible only via spring pad launches.',
    'Boost pads ignore standard top-speed caps for a short window—ride the surge across gaps.',
    'Do not hesitate at gaps; hesitating kills momentum needed to clear moving obstacles.',
  ],
  faq: [
    {
      question: 'Can I play with two players on the same keyboard?',
      answer:
        'Yes, Local 2-Player mode allows Player 1 to use WASD/Space while Player 2 uses Arrow Keys and Enter.',
    },
    {
      question: 'What happens if I miss a jump and fall into the pit?',
      answer:
        'You instantly respawn at the last activated laser checkpoint without losing your race progress.',
    },
    {
      question: 'Are there multiple courses to race on?',
      answer:
        'The track features diverse terrain segments including island hops, moving platform elevators, and highway sprint lanes.',
    },
  ],
});

export const platformRaceContent = platformRaceGame.content;
export const platformRaceDefinition = platformRaceGame.definition;
