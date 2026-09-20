import type { GameContent } from '@playdeck/game-types';

export const magnetMayhemContent: GameContent = {
  id: 'magnet-mayhem',
  seo: {
    title: 'Magnet Mayhem — Magnetic Physics Arena Battle | PlayDeck',
    description:
      'Control magnets to sling across anchors, blast rivals with repulsions, and collect targets in real-time physics matches on PlayDeck.',
    keywords: [
      'magnet mayhem',
      'magnetic physics game',
      'arcade physics arena',
      'multiplayer magnet game',
      'slingshot physics',
      'webrtc voice game',
      'online party game',
    ],
  },
  tagline:
    'Master magnetic attraction, slingshot across metallic anchors, and blast rivals into hazards.',
  overview: [
    'Magnet Mayhem is a fast-paced multiplayer physics arena where players pilot dual-pole magnetic capsules in intense 2 to 4 player duels.',
    'Attract pulls you toward metallic anchors, converting straight-line inertia into high-speed slingshots around obstacles and pulling lightweight target orbs toward your ship.',
    'Repel releases an explosive magnetic shockwave, knocking away rivals, pushing away contested targets, and launching opponents directly into crackling Tesla Coils.',
    'Collect floating Cyan, Gold, and Star target orbs to stack up points while managing your magnetic battery before the 60-second timer expires.',
  ],
  howToPlay: [
    {
      title: 'Aim Your Magnetic Flight Path',
      description:
        'Aim with your mouse cursor or touch drag. Your aim reticle sets the tractor beam direction and trajectory.',
    },
    {
      title: 'Attract to Slingshot Around Anchors',
      description:
        'Hold Left-Click or Space to project an attraction beam to the nearest anchor, slingshotting you with high momentum.',
    },
    {
      title: 'Fire Repulsion Shockwaves',
      description:
        'Right-Click or Shift emits an outward radial shockwave that blasts opponents and targets away from your position.',
    },
    {
      title: 'Collect Target Orbs & Avoid Hazards',
      description:
        'Snag Cyan (10 pts), Gold (25 pts), and Star (50 pts) orbs. Steer clear of red Tesla Coils that zap 5 points and stun you.',
    },
  ],
  controls: [
    { key: 'Mouse Movement / Touch', action: 'Aim magnetic reticle and flight vector' },
    { key: 'Left-Click / Space / Z', action: 'ATTRACT: Pull towards anchors & slingshot' },
    { key: 'Right-Click / Shift / X', action: 'REPEL: Radial magnetic repulsion shockwave' },
    { key: 'Mobile Touch Buttons', action: 'Dedicated PULL and BLAST on-screen buttons' },
    { key: 'Esc', action: 'Close dialogs or leave room' },
  ],
  rules: [
    {
      title: 'Magnetic Energy Reservoir',
      description:
        'Attracting and repelling consume magnet battery charge. Releasing actions allows your energy to rapidly regenerate.',
    },
    {
      title: 'Tesla Coil Hazards',
      description:
        'Colliding with an active electric hazard coil deducts 5 points, inflicts an 0.85s stun, and knocks you away with high impulse.',
    },
    {
      title: 'Target Value Tiers',
      description:
        'Target orbs respawn continuously across the arena: Cyan gems are worth 10 pts, Gold crystals 25 pts, and Cosmic Stars 50 pts.',
    },
    {
      title: 'Round Victory',
      description:
        'Matches run on a 60-second round clock. The pilot with the highest score when time expires is crowned Magnetic Champion.',
    },
  ],
  tips: [
    'Chain slingshots between diagonal anchors to build extreme tangential speed, making you nearly impossible for opponents to track.',
    'Bait opponents as they approach high-value gold and star targets, then activate REPEL at point-blank range to blast them away.',
    'Corner rivals against hazard coils: a well-timed repel blast can knock an opponent directly into a Tesla Coil for a devastating 5-point deduction.',
  ],
  faq: [
    {
      question: 'How many players can play Magnet Mayhem?',
      answer:
        'Magnet Mayhem supports 2 to 4 players. You can jump into solo mode with 1 to 3 AI bot competitors, or create an online multiplayer room with live voice chat.',
    },
    {
      question: 'What happens if my magnet battery runs out?',
      answer:
        'If your energy drops to zero, attraction and repulsion temporarily disengage. Release your inputs for a brief moment to recharge back to full power.',
    },
    {
      question: 'Can I play on touchscreens and mobile devices?',
      answer:
        'Yes! Mobile devices feature touch aiming and dedicated on-screen PULL and BLAST action buttons for seamless handheld play.',
    },
  ],
};
