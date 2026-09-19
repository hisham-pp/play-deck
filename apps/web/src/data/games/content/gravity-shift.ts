import type { GameContent } from '@playdeck/game-types';

export const gravityShiftContent: GameContent = {
  id: 'gravity-shift',
  seo: {
    title: 'Gravity Shift — 4-Way Gravity Inverting Race | PlayDeck',
    description:
      'Race along walls, ceilings, and floors in a 4-way gravity shifting circuit. Outmaneuver rivals, dodge laser traps, and cross the vortex in real time.',
    keywords: [
      'gravity shift',
      'gravity runner',
      'multiplayer gravity game',
      'gravity runner online',
      'arcade racing game',
      'physics platformer',
      'webrtc voice game',
    ],
  },
  tagline: 'Rotate the world. Turn walls into runways. Outrace the singularity.',
  overview: [
    'Gravity Shift is a chaotic high-speed platform racing game where any competitor can rotate the direction of gravity by 90 degrees at any moment.',
    'Sprint across floorboards, leap onto vertical walls, sprint across ceilings, and slingshot through hazardous energy fields. When someone shifts gravity, everyone in the arena falls in the new direction simultaneously.',
    'Compete offline against nimble AI bots or create an online multiplayer room for up to 6 racers with integrated real-time WebRTC voice chat.',
  ],
  howToPlay: [
    {
      title: 'Navigate the Multi-Directional Course',
      description:
        'Run along platforms and leap across gaps. Follow the numbered checkpoints toward the pulsating exit vortex.',
    },
    {
      title: 'Tactically Invert Gravity',
      description:
        'Use Q and E or Shift + Arrow keys to rotate the entire arena’s gravity vector, converting vertical climbs into horizontal sprints.',
    },
    {
      title: 'Dodge Lasers & Launch off Bounce Pads',
      description:
        'Avoid glowing hazard barriers that reset you to your last checkpoint, and hit purple bounce pads for massive aerial boosts.',
    },
    {
      title: 'Reach the Checkpoints & Finish Line',
      description:
        'Passing checkpoints recharges your gravity shift meter and sets your respawn location. First racer through the exit vortex wins.',
    },
  ],
  controls: [
    { key: 'A / D or Left / Right', action: 'Move along surface tangent' },
    { key: 'Space / W / Up', action: 'Jump / Leap off walls' },
    { key: 'Q / E', action: 'Rotate Gravity Counter-Clockwise / Clockwise' },
    { key: 'Shift + Arrows', action: 'Instant 4-Way Gravity Direction Shift' },
    { key: 'R', action: 'Restart race (Solo Mode)' },
  ],
  rules: [
    {
      title: 'Universal Gravitational Reversal',
      description:
        'Whenever any player triggers a gravity shift, gravity flips for all players simultaneously, creating unpredictable aerial chaos.',
    },
    {
      title: 'Limited Shift Energy',
      description:
        'Each racer carries up to 3 gravity shift charges. Charges are refilled upon passing checkpoints or collecting energy cores.',
    },
    {
      title: 'Checkpoint Progression',
      description:
        'Racers must activate checkpoints sequentially. Crossing the finish portal only counts if all prior checkpoints have been cleared.',
    },
  ],
  tips: [
    'Shift gravity right when an opponent is mid-air over a hazard to send them plummeting toward laser grids.',
    'Coyote time and jump buffering allow you to leap a fraction of a second after stepping off a platform edge.',
    'Use purple bounce pads right before shifting gravity to fling your racer across entire sectors of the map.',
  ],
  faq: [
    {
      question: 'How does gravity shifting affect other players in multiplayer?',
      answer:
        'Gravity is global to the arena. When any racer shifts gravity, all racers immediately experience the new gravitational vector and fall in that direction.',
    },
    {
      question: 'Can I play Gravity Shift solo?',
      answer:
        'Yes! You can race solo against 1 to 5 AI bots with reactive trajectory calculations across any course.',
    },
    {
      question: 'Does Gravity Shift support WebRTC voice chat?',
      answer:
        'Yes. In multiplayer rooms, high-fidelity mesh voice chat enables spontaneous banter, shouts, and coordination.',
    },
  ],
};
