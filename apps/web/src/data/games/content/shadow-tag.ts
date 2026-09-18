import type { GameContent } from '@playdeck/game-types';

export const shadowTagContent: GameContent = {
  id: 'shadow-tag',
  seo: {
    title: 'Shadow Tag — Stealth Arena Tag Game Online',
    description:
      'Play Shadow Tag free online. Hunt and evade in the dark where players are invisible. Track dynamic shadows cast by orbiting spotlights to survive.',
    keywords: [
      'shadow tag',
      'stealth tag game',
      'invisible tag multiplayer',
      'shadow mechanics game',
      'browser tag arena',
      'free multiplayer stealth',
      'voice chat party game',
    ],
  },
  tagline: 'Run in the darkness. Step into the spotlight and your shadow gives you away.',
  overview: [
    'Shadow Tag is an intense multiplayer stealth chase game set in pitch-black arenas illuminated only by orbiting searchlights. All players are completely invisible in the darkness.',
    'Whenever a runner crosses a moving light beam, their elongated shadow is cast across the arena floor and obstacles. Chasers must read these shadow projections, dust footsteps, and environmental disturbances to track down their prey.',
    'Play solo against sharp AI shadows or launch an online room for up to 6 players with real-time WebRTC voice chat. Coordinate, sneak quietly, and tamper with light fixtures to survive the hunt.',
  ],
  howToPlay: [
    {
      title: 'Blend into the shadows',
      description:
        'Stay inside the dark regions cast by pillars and barriers to remain invisible to other players and the chaser.',
    },
    {
      title: 'Watch for projected shadows',
      description:
        'When runners step into rotating spotlights, their shadows stretch across the arena floor, exposing their heading and distance.',
    },
    {
      title: 'Sneak to muffle footsteps',
      description:
        'Holding the sneak key slows your sprint but prevents kicking up visible dust clouds that alert nearby stalkers.',
    },
    {
      title: 'Tamper with arena spotlights',
      description:
        'Interact with nearby lamps to briefly extinguish their beams or reverse their orbit direction to create escape windows.',
    },
  ],
  rules: [
    {
      title: 'Stealth invisibility',
      description:
        'Players cannot be seen directly by others. Only shadows, footprints in the dust, and disturbed props reveal coordinates.',
    },
    {
      title: 'Passing the mark',
      description:
        'The player who is "It" must collide with a runner to tag them. A brief grace window prevents instant counter-tagging.',
    },
    {
      title: 'Survival scoring',
      description:
        'Runners earn points for every second they stay free of the mark. Successful tags award bonus points to the chaser.',
    },
    {
      title: 'Round timer',
      description:
        'Matches run against a fixed clock. When the lights turn on, the player with the highest survival and tagging score wins.',
    },
  ],
  controls: [
    { key: 'W / A / S / D or Arrows', action: 'Move runner' },
    { key: 'Shift', action: 'Sneak (silent, leaves no dust)' },
    { key: 'E / Space', action: 'Cover nearest lamp' },
    { key: 'Q', action: 'Reverse nearest lamp orbit' },
    { key: 'Touch / On-Screen Pad', action: 'Mobile virtual controls' },
  ],
  tips: [
    'Observe the light orbits: anticipate where shadows will sweep before sprinting through illuminated clearings.',
    'Use props as decoys: purposely brushing against clutter can send chasers chasing a false trail.',
    'Cover lamps strategically: extinguishing a lamp at a crucial junction blinds the chaser just as they close in.',
    'Communicate with voice: online rooms allow runners to warn teammates about the chaser’s approaching shadow.',
  ],
  faq: [
    {
      question: 'How many players can join Shadow Tag?',
      answer:
        'Shadow Tag supports 2 to 6 players. In offline matches or smaller parties, responsive AI shadow bots fill any open slots.',
    },
    {
      question: 'How do you see other players?',
      answer:
        'You cannot see opponents directly. You only see the dynamic shadows they cast when illuminated by spotlights, their dust trails, and disturbed objects.',
    },
    {
      question: 'Is voice chat available during online play?',
      answer:
        'Yes! Online rooms include built-in WebRTC peer-to-peer voice chat so you can whisper, distract, or strategize with friends in real time.',
    },
  ],
};
