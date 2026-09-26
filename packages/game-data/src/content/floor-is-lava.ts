import { defineGameModule } from '../core/base-game';
import { GameCategories, GameControlKeys, GameReleaseDates, GameTags } from '../enums';
import { getPCount } from '../helpers/players.utils';

export const floorIsLavaGame = defineGameModule({
  id: 'floor-is-lava',
  description:
    'The ground collapses beneath your feet! Push rivals into rising molten lava, secure power-up tiles, and be the last player standing in frantic real-time combat.',
  category: GameCategories.A,
  players: getPCount(1, 6),
  releaseDate: GameReleaseDates.D_2026_09_19,
  tags: [GameTags.A, GameTags.M_P, GameTags.V_C, GameTags.PH, GameTags.LP, GameTags.S],
  seo: {
    title: 'Floor Is Lava — Disappearing Tile Survival Battle | PlayDeck',
    description:
      'Survive collapsing tiles over molten lava in real time. Push opponents into magma, grab power-up platforms, and be the last survivor on PlayDeck.',
    keywords: [
      'floor is lava',
      'disappearing tile game',
      'survival arena',
      'multiplayer arcade game',
      'physics battle',
      'online lava game',
      'webrtc voice game',
    ],
  },
  tagline: 'The floor is crumbling. Push rivals into the molten depths to be the last survivor.',
  overview: [
    'Floor Is Lava is a high-intensity multiplayer arena battle where the platform beneath your feet is constantly deteriorating into bubbling magma.',
    'Outer rings sink first, forcing players into frantic close-quarters combat at the center. Standing still too long degrades tile stability, so you must keep moving while timing powerful pushes to blast opponents off the edge.',
    'Scattered power-up tiles allow you to summon temporary platforms, freeze the arena, perform double jumps, or unleash super-pushes with shockwaves.',
    'Play solo against tactical AI survival bots or host an online room for up to 6 players with spatial WebRTC mesh voice chat.',
  ],
  howToPlay: [
    {
      title: 'Move Across Safe Tiles',
      description:
        'Navigate the 10x10 arena using Arrow keys or WASD. Green tiles are solid; yellow tiles are shaking; red tiles will plunge into magma within seconds.',
    },
    {
      title: 'Avoid Dwell Degradation',
      description:
        'Lava heat intensifies under stationary players. Standing on any tile for too long will crack it beneath your feet.',
    },
    {
      title: 'Push Rivals Into the Magma',
      description:
        'Press Space or tap the Push button to blast nearby opponents backward with directional physics knockback.',
    },
    {
      title: 'Claim Power-Up Items',
      description:
        'Step on glowing power-up markers to obtain Emergency Platforms, Arena Freezes, Double Jumps, or Super Pushes.',
    },
  ],
  rules: [
    {
      title: 'Inward Arena Sinking',
      description:
        'Every few seconds, the outermost ring of remaining tiles begins its collapse cycle, shrinking the playable space inward.',
    },
    {
      title: 'Molten Elimination',
      description:
        'Falling into lava instantly eliminates the player from the round. Last surviving player standing wins.',
    },
    {
      title: 'Push Cooldown & Recharging',
      description:
        'Pushing has a 1.2-second cooldown. Super-push power-ups temporarily triple the knockback distance and range.',
    },
    {
      title: 'Temporary Platforms',
      description:
        'Emergency platform power-ups spawn temporary safe ground in surrounding lava for 6 seconds.',
    },
  ],
  controls: [
    {
      key: GameControlKeys.WASD_ARROWS,
      action: 'Move survivor in 8 directions',
    },
    {
      key: 'Space or Click Push',
      action: 'Execute push shockwave on rivals',
    },
    {
      key: GameControlKeys.R_RESTART,
      action: 'Restart battle (Solo mode)',
    },
    {
      key: GameControlKeys.ESC,
      action: 'Close modal or menu',
    },
  ],
  tips: [
    'Never stand still for too long: dwell time degrades tile health quickly, so circular movement patterns keep tiles intact longer.',
    'Bait pushes near crumbling edges: lure aggressive opponents toward border tiles, then dodge their rush and counter-push them into the abyss.',
    'Save double jumps for emergencies: double jumping lets you leap across sunken gaps to reach isolated safe islands in the middle of the caldera.',
  ],
  faq: [
    {
      question: 'How many players can participate in a Floor Is Lava match?',
      answer:
        'Matches support 1 to 6 players. In solo mode, you can battle against 1 to 5 AI bots. In online multiplayer rooms, up to 6 players can battle with WebRTC voice chat.',
    },
    {
      question: 'What happens when all remaining tiles collapse?',
      answer:
        'If the match reaches the final center tile and no single player survives, the match ends in a draw.',
    },
    {
      question: 'Does voice chat require any external plugins?',
      answer:
        'No. Voice chat uses native browser WebRTC peer connections coordinated automatically over the room channel.',
    },
  ],
});

export const floorIsLavaContent = floorIsLavaGame.content;
export const floorIsLavaDefinition = floorIsLavaGame.definition;
