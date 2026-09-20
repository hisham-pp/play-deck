import type { GameContent } from '@playdeck/game-types';

export const lootDashContent: GameContent = {
  id: 'loot-dash',
  seo: {
    title: 'Loot Dash — Fast-Paced Arena Loot Scavenger | PlayDeck',
    description:
      'Sprint through chaotic arenas collecting coins, gems, and treasure chests while evading spike traps and stealing riches in Loot Dash on PlayDeck.',
    keywords: [
      'loot dash',
      'loot scavenger game',
      'arena dash game',
      'multiplayer loot runner',
      'arcade collection game',
      'webrtc voice game',
      'top-down runner',
    ],
  },
  tagline:
    'Dash around hazard-filled arenas, scavenge valuable loot, trigger traps, and rob your rivals.',
  overview: [
    'Loot Dash is a fast-paced multiplayer top-down arcade scavenger game where 2 to 6 sprinters dash around an obstacle-filled arena collecting randomly spawning coins, gems, and mystery chests.',
    'Traps spawn alongside loot: cyclic retractable spike traps that stun runners and knock loose their hard-earned coins, sticky slime slowdown pools that cut movement speed, and sneaky player-deployed decoy gems.',
    'Arm yourself with game-turning power-ups: Speed Boost for lightning sprints, Loot Magnet to vacuum nearby riches, Trap Shield for hazard immunity, and Thief Gloves to body-bump opponents and steal their loot.',
    'Compete solo against responsive AI bots or battle friends in real-time online rooms with seamless WebRTC voice chat to laugh at every steal and trap disaster.',
  ],
  howToPlay: [
    {
      title: 'Dash and Collect Loot',
      description:
        'Use WASD or arrow keys (or the on-screen touch D-Pad) to navigate the arena. Scoop up bronze coins (+5), silver coins (+10), gold bars (+25), and diamond gems (+50).',
    },
    {
      title: 'Evade Arena Hazards',
      description:
        'Watch for the rhythmic activation cycle of spike traps. Stepping on active spikes stuns you and scatters coins. Stepping in slime slows you to a crawl.',
    },
    {
      title: 'Harness Power-Ups',
      description:
        'Crack open mystery treasure chests (+100) to activate speed bursts, loot magnets, hazard shields, or thief gloves.',
    },
    {
      title: 'Bump and Steal',
      description:
        'Equip Thief Gloves and ram into opponents to knock coins and gems directly into your pockets.',
    },
  ],
  controls: [
    { key: 'W / A / S / D or Arrows', action: 'Move sprinter in all directions' },
    { key: 'Spacebar / E', action: 'Deploy decoy trap (when equipped)' },
    { key: 'Touch D-Pad', action: 'On-screen virtual directional navigation' },
    { key: 'Esc', action: 'Pause match or return to lobby' },
  ],
  rules: [
    {
      title: 'Scoring & Target Points',
      description:
        'The first player to reach the match target score (150, 250, or 400 points) or the player with the most points when the timer runs out wins the round.',
    },
    {
      title: 'Periodic Jackpot Drops',
      description:
        'Every 25–30 seconds, a massive jackpot burst erupts in the arena center, spewing high-value gold bars and gems.',
    },
    {
      title: 'Hazard Stun & Loot Loss',
      description:
        'Getting caught in extended spike traps or tricked by a decoy gem stuns your sprinter for 1.5 seconds and drops loose coins for rivals to scavenge.',
    },
    {
      title: 'Elastic Bumping Mechanics',
      description:
        'Players physically bump each other upon collision, ricocheting off bumpers and obstacles with elastic momentum.',
    },
  ],
  tips: [
    'Time your runs through the spike corridors right after the spikes retract into the floor for safe crossing.',
    'When you activate the Loot Magnet, sprint through dense coin clusters to vacuum them instantly before opponents can react.',
    'Drop a Decoy Gem in front of a treasure chest to bait greedy opponents into a stunning explosion.',
  ],
  faq: [
    {
      question: 'How many players can join a Loot Dash match?',
      answer:
        'Loot Dash supports 2 to 6 runners. You can play solo with autonomous AI bots or host a room for friends with live voice chat.',
    },
    {
      question: 'What do the power-ups do?',
      answer:
        'Power-ups include Speed Boost (+50% velocity), Loot Magnet (pulls coins and gems from afar), Trap Shield (spikes and slime immunity), and Thief Gloves (steal points on bump).',
    },
    {
      question: 'Is Loot Dash playable on mobile devices?',
      answer:
        'Yes! Loot Dash features on-screen virtual directional controls and a dedicated trap button for touchscreens.',
    },
  ],
};
