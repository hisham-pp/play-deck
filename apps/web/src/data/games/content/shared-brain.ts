import type { GameContent } from '@playdeck/game-types';

export const sharedBrainContent: GameContent = {
  id: 'shared-brain',
  seo: {
    title: 'Shared Brain — 2-Player Dual-Control Platformer | PlayDeck',
    description:
      'Cooperate in pairs where one player steers and the other commands jumps and switches. Tackle obstacle courses together with integrated voice chat.',
    keywords: [
      'shared brain',
      'dual control platformer',
      '2 player cooperative game',
      'voice chat platformer',
      'webrtc co-op browser',
      'team platformer',
      'playdeck shared brain',
    ],
  },
  tagline: 'Two minds. One avatar. Pure cooperative synchronization.',
  overview: [
    'Shared Brain is an asymmetrical cooperative platformer where two players take simultaneous command of different halves of a single avatar.',
    'The Navigator hemisphere governs left and right horizontal momentum and steering, while the Motor hemisphere dictates jumping heights, bouncy spring triggers, and lever interactions.',
    'Without constant verbal communication and synchronized reflexes, the dual-minded avatar will stumble into hazards and chasms. Jump into 2-player co-op or race multiple pairs head-to-head with integrated low-latency WebRTC voice chat.',
  ],
  howToPlay: [
    {
      title: 'Assign Your Roles',
      description:
        'One player assumes the role of Navigator (controlling left/right steering), while the partner becomes the Motor (controlling jump timing and lever interactions).',
    },
    {
      title: 'Communicate Over Voice Chat',
      description:
        'Call out upcoming hazards, count down jump launches ("3, 2, 1, jump!"), and alert your partner when passing interactive switches.',
    },
    {
      title: 'Collect Brain Tokens & Unlock Doors',
      description:
        'Explore multi-tiered courses to collect glowing Brain Tokens and pull wall levers that open locked laser barriers across the map.',
    },
    {
      title: 'Reach the Synaptic Vortex',
      description:
        'Navigate across floating platforms and spike pits to touch the swirling finish portal with the fewest resets and fastest run time.',
    },
  ],
  controls: [
    { key: 'A / D or Left / Right', action: 'Navigator: Steer horizontal movement' },
    { key: 'Spacebar / W / Up', action: 'Motor: Jump and spring bounce' },
    { key: 'E / S / Down', action: 'Motor: Pull levers & toggle door switches' },
    { key: 'Solo Dual-Control', action: 'Use all controls simultaneously in solo mode' },
  ],
  rules: [
    {
      title: 'Dual-Hemisphere Control Partition',
      description:
        'Neither player possesses full control over the character independently. The Navigator cannot jump, and the Motor cannot alter horizontal velocity.',
    },
    {
      title: 'Simultaneous Checkpoint Respawn',
      description:
        'Falling into laser hazards or bottomless pits resets the pair back to the course spawn point while retaining collected tokens.',
    },
    {
      title: 'Multi-Team Competitive Mode',
      description:
        'In rooms with 4 or 6 players, players form competing pairs (Team 1 Cyan/Amber, Team 2 Pink/Green, Team 3 Purple/Orange) racing to finish first.',
    },
  ],
  tips: [
    'Establish a cadence: the Motor should call "jump!" a split second before pressing the key so the Navigator maintains full forward momentum.',
    'Bouncy pads multiply upward velocity—release the horizontal controls momentarily on bounce pads to avoid overshooting narrow platforms.',
    'In Solo training mode, practice with the adaptive AI Buddy Bot to learn optimal jump distances before challenging live human partners.',
    'Keep your microphone active using the integrated voice chat dock so your hands remain glued to your controls.',
  ],
  faq: [
    {
      question: 'Can I play Shared Brain alone?',
      answer:
        'Yes! You can play in Solo Dual-Control mode (controlling both Navigator and Motor keys simultaneously) or partner with an AI Buddy Bot.',
    },
    {
      question: 'How many players can join a multiplayer room?',
      answer:
        'From 2 up to 6 players can connect in a private room. Players are automatically paired into two-person teams (up to 3 teams total).',
    },
    {
      question: 'Why is voice chat recommended?',
      answer:
        'Shared Brain requires micro-second coordination between running and leaping. Verbal callouts make difficult platforming segments substantially smoother.',
    },
  ],
};
