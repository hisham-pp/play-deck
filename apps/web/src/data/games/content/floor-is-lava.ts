import type { GameContent } from '@playdeck/game-types';

export const floorIsLavaContent: GameContent = {
  id: 'floor-is-lava',
  seo: {
    title: 'Floor Is Lava — Disappearing Tile Survival Battle | PlayDeck',
    description:
      'Scramble across crumbling tiles over rising molten lava. Bump rivals into the magma, grab power-ups, and be the last survivor in frantic multiplayer.',
    keywords: [
      'floor is lava',
      'floor is lava online',
      'disappearing tiles game',
      'multiplayer survival game',
      'arcade battle royale',
      'party game',
      'webrtc voice game',
    ],
  },
  tagline: 'The ground is turning to magma. Bump rivals into the heat and stand your ground.',
  overview: [
    'Floor Is Lava is a frantic survival arena where floating platform tiles crack, heat up, and dissolve into bubbling molten lava.',
    'As the safe perimeter collapses toward the center, players must constantly reposition, anticipate fissure cascades, and bump adjacent competitors into the magma.',
    'Play solo against reactive AI bots or launch an online multiplayer match for up to 6 players featuring real-time WebRTC mesh voice chat.',
  ],
  howToPlay: [
    {
      title: 'Keep Moving Across Safe Tiles',
      description:
        'Tiles shift from safe to warning, then begin cracking before collapsing into lava. Standing on a tile accelerates its decay.',
    },
    {
      title: 'Shove Opponents with Space',
      description:
        'Use the push mechanic to knock nearby players off decaying edges and directly into the molten sea below.',
    },
    {
      title: 'Snatch Tactical Power-Ups',
      description:
        'Collect Platforms to spawn fresh footholds, Super Push for colossal knockback, Freeze to stabilize tiles, or Double Jump to leap across gaps.',
    },
    {
      title: 'Outlast Every Competitor',
      description:
        'Avoid elimination by remaining on solid ground as the arena shrinks. The last player standing wins the match.',
    },
  ],
  controls: [
    { key: 'W / A / S / D or Arrows', action: 'Move across arena tiles' },
    { key: 'Space', action: 'Shove / Push nearby rivals' },
    { key: 'R', action: 'Restart match (Solo mode)' },
  ],
  rules: [
    {
      title: 'Progressive Arena Collapse',
      description:
        'Tiles degrade from the outer rim inward in a semi-random pattern. Standing on tiles too long rapidly expedites their collapse.',
    },
    {
      title: 'Instant Elimination',
      description:
        'Touching a molten lava tile eliminates a player immediately from the current round.',
    },
    {
      title: 'Push Impulses & Cooldowns',
      description:
        'Pushing applies an explosive knockback impulse to opponents within range. Each push triggers a short tactical cooldown.',
    },
  ],
  tips: [
    'Stay near the center during early phases, but watch out for converging rivals who want to shove you.',
    'Grab the Freeze power-up when multiple tiles are cracking to buy crucial breathing room.',
    'Baited jumps: pretend to flee toward an edge and shove your pursuer as they attempt to cut you off.',
  ],
  faq: [
    {
      question: 'How many players can participate in Floor Is Lava?',
      answer:
        'Matches support 2 to 6 players, either locally against AI bots or online with friends via room codes.',
    },
    {
      question: 'Does the game feature built-in voice chat?',
      answer:
        'Yes! Online rooms include seamless peer-to-peer WebRTC mesh voice chat with spatial awareness and muting options.',
    },
    {
      question: 'Can I play Floor Is Lava on touch devices?',
      answer:
        'Yes, mobile and touch interfaces are supported with on-screen virtual directional navigation and push buttons.',
    },
  ],
};
