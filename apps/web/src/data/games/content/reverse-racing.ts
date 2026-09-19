import type { GameContent } from '@playdeck/game-types';

export const reverseRacingContent: GameContent = {
  id: 'reverse-racing',
  seo: {
    title: 'Reverse Racing — Racer vs Saboteur Arcade | PlayDeck',
    description:
      "Speed down the circuit while deploying deadly roadblocks and oil slicks onto your rivals' tracks in a high-octane asymmetrical racer with voice chat.",
    keywords: [
      'reverse racing',
      'asymmetrical racer',
      'saboteur racing game',
      'multiplayer racing browser',
      'online arcade racer',
      'webrtc voice racing',
      'playdeck racing',
    ],
  },
  tagline: 'Full throttle ahead. Deadly hazards behind.',
  overview: [
    'Reverse Racing turns traditional motorsport upside down with simultaneous asymmetrical competition.',
    'You are not just a driver navigating three intense lanes at blinding speeds—you are also a ruthless saboteur controlling the tactical radar of the competitor behind you in a circular chain of chaos.',
    'Spend regenerating tactical energy to drop roadblocks, greasy oil slicks, speed bumps, oscillating walls, and risky boost pads in real time. Balance pure driving reflexes with cutthroat hazard deployment to take the checkered flag.',
  ],
  howToPlay: [
    {
      title: 'Steer and Leap Down the Circuit',
      description:
        'Use A/D or Left/Right Arrow keys to switch between the 3 lanes. Press Space or W to jump over low barriers and speed traps.',
    },
    {
      title: 'Monitor Your Saboteur Radar',
      description:
        'Keep one eye on the right side of the screen to watch your assigned target driver speeding along their respective circuit.',
    },
    {
      title: 'Deploy Tactical Hazards',
      description:
        'Select an obstacle with keys 1–6 or click the toolbar, then click on the target track ahead of their vehicle to drop it into their path.',
    },
    {
      title: 'Survive the Checkered Flag',
      description:
        'Dodge incoming hazards placed by the player sabotaging your track and reach the 1,000-meter finish line with the lowest elapsed time.',
    },
  ],
  controls: [
    { key: 'A / D or Left / Right', action: 'Steer vehicle between lanes' },
    { key: 'Spacebar / W / Up', action: 'Jump vehicle over obstacles' },
    { key: 'S / Down', action: 'Apply brake deceleration' },
    { key: '1 to 6', action: 'Select obstacle to deploy' },
    { key: 'Mouse Click', action: 'Deploy selected obstacle on target radar' },
  ],
  rules: [
    {
      title: 'Circular Sabotage Chain',
      description:
        'In any match with 2 to 6 players, player N sabotages player N-1 in a closed loop. No player can sabotage themselves.',
    },
    {
      title: 'Fairness Validation Window',
      description:
        'Obstacles cannot be placed within 18 meters of a racer to prevent unavoidable instant crashes, nor inside spawn or finish zones.',
    },
    {
      title: 'Tactical Energy Management',
      description:
        'Deploying hazards consumes tactical energy (15 to 35 energy per hazard). Energy steadily recharges up to a maximum reserve of 100.',
    },
    {
      title: 'Crash Penalty & Recovery',
      description:
        'Direct collision with a solid barrier brings the vehicle to a halt for a 1.2-second recovery timer before accelerating back to top speed.',
    },
  ],
  tips: [
    'Save energy until your target approaches a narrow gap, then drop a roadblock into their escape lane.',
    'Oil slicks lock the steering wheel for 1.4 seconds—pair an oil slick directly before a roadblock for an unavoidable trap.',
    'Boost pads force target vehicles into extreme velocities, making upcoming hazards much harder to react to.',
    'Watch the shadow of your vehicle while jumping to accurately time when your wheels will touch the road again.',
  ],
  faq: [
    {
      question: 'Can I play Reverse Racing solo?',
      answer:
        'Yes! You can choose Solo Arcade to race against 1 to 5 adaptive AI bots that dodge hazards and dynamically place roadblocks on your track.',
    },
    {
      question: 'How does multiplayer matchmaking work?',
      answer:
        'Host a private room to receive a room code or share link. Up to 6 players can join with full mesh WebRTC voice chat and customizable vehicle colors.',
    },
    {
      question: 'Can obstacles completely block the road?',
      answer:
        'No. The placement engine prevents simultaneous solid blockades across all three lanes, ensuring there is always a viable dodge lane or jump window.',
    },
  ],
};
