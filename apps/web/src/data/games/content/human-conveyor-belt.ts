import type { GameContent } from '@playdeck/game-types';

export const humanConveyorBeltContent: GameContent = {
  id: 'human-conveyor-belt',
  seo: {
    title: 'Human Conveyor Belt — Co-op Physics Online',
    description:
      'Play Human Conveyor Belt free online. Coordinate with friends as living conveyor segments to move fragile and heavy cargo safely across the factory floor.',
    keywords: [
      'human conveyor belt',
      'co-op physics game',
      'multiplayer conveyor game',
      'rube goldberg co-op',
      'voice chat physics game',
      'factory coordination game',
      'free browser multiplayer',
    ],
  },
  tagline: 'You are the machine parts. Tilt, elevate, and deliver.',
  overview: [
    'Human Conveyor Belt is a cooperative physics multiplayer game where players do not simply operate the factory machinery — they ARE the machinery. Each player commands a conveyor platform segment that can tilt, raise, lower, and drive forward or reverse.',
    'Objects of all shapes, weights, and fragile properties roll, bounce, and slide across the factory floor. From bouncy rubber orbs to delicate glass flasks and heavy steel vaults, success depends on instantaneous communication and platform synchronization over integrated voice chat.',
    'Play solo alongside intelligent AI platform assistants, or assemble up to 6 players in an online private room. Conquer 4 escalating machine configurations from The Induction Chute to the chaotic Rube Goldberg Gauntlet.',
  ],
  howToPlay: [
    {
      title: 'Watch the spawn chute',
      description:
        'Cargo drops from the automated feeder on the left. Check the incoming item type so your team can prepare the correct tilt angle.',
    },
    {
      title: 'Align your platform segment',
      description:
        'Use keyboard or on-screen controls to tilt and elevate your platform. Match the height of adjacent segments to build a smooth bridge.',
    },
    {
      title: 'Drive the conveyor belt',
      description:
        'Accelerate the belt tread forward to propel rolling cargo across gaps, or reverse to cushion and brake fragile deliveries.',
    },
    {
      title: 'Deposit into the hopper',
      description:
        'Guide each item into the glowing delivery hopper on the right to score points, build your team combo streak, and clear the wave quota.',
    },
  ],
  rules: [
    {
      title: 'Fragile cargo shatters on hard impacts',
      description:
        'Glass beakers and delicate crystals fracture if dropped from excessive heights or struck against flat platforms at high normal velocity.',
    },
    {
      title: 'Heavy vaults sag and compress',
      description:
        'Dense steel crates carry high inertia and minimal bounce. Elevate your platform early to catch and push heavy cargo.',
    },
    {
      title: 'Avoid the hazard pit',
      description:
        'Any item falling below the platform line drops into the crush pit, resetting your team combo streak and wasting valuable quota time.',
    },
    {
      title: 'Explosive cargo is on the clock',
      description:
        'Ticking bomb crates feature an active detonation fuse. Deliver them promptly before their countdown reaches zero.',
    },
  ],
  controls: [
    { key: 'Q / E or ← / →', action: 'Tilt platform left or right' },
    { key: 'W / S or ↑ / ↓', action: 'Elevate platform up or down' },
    { key: 'A / D', action: 'Conveyor belt forward (D) or reverse (A)' },
    { key: 'Mouse / Touch', action: 'Tap on-screen directional buttons' },
  ],
  tips: [
    'Call out catches over voice: alert the next teammate down the line before releasing delicate cargo.',
    'Feather your speed on fragile items: angle gently downward and run at moderate speeds so glassware glides.',
    'Use wind tunnels to regain height: thermal updrafts can boost objects over rotating cog obstacles.',
    'Elevate early for heavy steel vaults: dense crates carry high momentum and need a level landing.',
  ],
  faq: [
    {
      question: 'How many players can join a match?',
      answer:
        'Human Conveyor Belt supports 2 to 6 players. In solo or smaller groups, intelligent AI platform assistants automatically fill empty slots.',
    },
    {
      question: 'Do I need to install any software or plugins to use voice chat?',
      answer:
        'No. Voice chat runs entirely in your browser using high-performance WebRTC mesh audio directly connected to your game room.',
    },
    {
      question: 'Can I play on mobile or tablet touchscreens?',
      answer:
        'Yes. Human Conveyor Belt features dedicated on-screen tilt, height, and belt speed buttons designed for touch displays.',
    },
  ],
};
