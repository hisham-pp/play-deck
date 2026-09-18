import type { GameContent } from '@playdeck/game-types';

export const unstableElevatorContent: GameContent = {
  id: 'unstable-elevator',
  seo: {
    title: 'Unstable Elevator — Physics Cargo Stacking Online',
    description:
      'Play Unstable Elevator free online. Balance precarious physics cargo on a climbing lift with friends. Communicate over voice chat to reach the summit.',
    keywords: [
      'unstable elevator',
      'physics stacking game',
      'co-op elevator game',
      'cargo balance multiplayer',
      'browser physics party',
      'free multiplayer physics',
      'voice chat party game',
    ],
  },
  tagline: 'Stack the cargo. Balance the platform. Survive the ascent together.',
  overview: [
    'Unstable Elevator is a cooperative physics puzzle and balance game for 2 to 4 players. Together, your crew operates a high-speed freight elevator ascending through a precarious industrial shaft.',
    'At each floor, the elevator slows as an overhead crane lowers awkward, heavy industrial cargo. Players take turns steering the claw and releasing objects onto the tilting platform.',
    'As the lift accelerates, sudden tremors and shifting weight threaten to throw your tower into the abyss. Coordinate with voice chat, balance the center of gravity, and see how high your crew can climb.',
  ],
  howToPlay: [
    {
      title: 'Steer the loading claw',
      description:
        'When your turn arrives, slide the crane left and right across the platform width, and rotate the cargo to find a stable resting angle.',
    },
    {
      title: 'Release with precision',
      description:
        'Drop the freight when you are confident it will settle securely on the elevator deck or nestle into existing stacked containers.',
    },
    {
      title: 'Withstand the ascent',
      description:
        'Once cargo settles, the lift accelerates to the next floor. Sudden vibrations and momentum will test the structural stability of your stack.',
    },
    {
      title: 'Preserve your slips',
      description:
        'Every container that tumbles off the edge costs one slip. If the crew runs out of slips, the elevator mechanism buckles and the run collapses.',
    },
  ],
  rules: [
    {
      title: 'Turn-based crane control',
      description:
        'Each player commands the loading crane for one floor in rotation. The active player holds the wrench while others observe and advise.',
    },
    {
      title: 'Real physics simulation',
      description:
        'Every container possesses genuine mass, friction, and moment of inertia. Heavy crates compress springs while tall girders topple easily.',
    },
    {
      title: 'Shared slip allowance',
      description:
        'The team shares a pooled slip counter. Losing too much cargo over the sides immediately terminates the expedition.',
    },
    {
      title: 'Score and height records',
      description:
        'Clearing floors without losing cargo awards escalating team bonuses, logging record climbs in your persistent career ledger.',
    },
  ],
  controls: [
    { key: 'A / D or Left / Right Arrows', action: 'Nudge claw horizontally' },
    { key: 'Q / E', action: 'Rotate cargo angle' },
    { key: 'Space / Enter / Down Arrow', action: 'Release and drop cargo' },
    { key: 'Mouse / Touch Drag', action: 'Direct crane positioning' },
  ],
  tips: [
    'Create a wide base: place broad, flat crates on the bottom floor to distribute weight across the platform springs.',
    'Counterbalance uneven loads: if the deck tilts heavily left, place the next heavy component toward the right rim.',
    'Shout directions on voice: teammates often have a clearer perspective on whether a falling crate will hook or slide.',
    'Do not rush the drop: wait until the claw completely stops swinging before releasing precarious cylindrical cargo.',
  ],
  faq: [
    {
      question: 'How many players can join an elevator run?',
      answer:
        'Unstable Elevator supports 2 to 4 players. In offline mode or when playing solo, steady AI bots take turns steering the crane alongside you.',
    },
    {
      question: 'What causes the lift to collapse?',
      answer:
        'The elevator collapses if cargo falls over the platform edge and depletes all remaining slip allowances.',
    },
    {
      question: 'Can I play with friends online over voice chat?',
      answer:
        'Yes! Online rooms provide seamless browser WebRTC peer-to-peer voice chat so your crew can call out drops and warn of tilting cargo.',
    },
  ],
};
