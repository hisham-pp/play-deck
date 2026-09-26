import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const gravityGolfGame = defineGameModule({
  id: 'gravity-golf',
  description:
    'Manipulate cosmic gravity wells, repellers, and orbital fields to guide your golf orb into the galactic hole in the fewest placements.',
  category: GameCategories.A,
  players: getPCount(1, 4),
  releaseDate: '2026-09-19',
  tags: [GameTags.A, GameTags.PH, GameTags.M_P, GameTags.V_C, GameTags.S, GameTags.LP],
  seo: {
    title: 'Gravity Golf — Orbital Physics Puzzle Game | PlayDeck',
    description:
      'Guide your golf orb into cosmic holes by placing gravity wells, shields, and orbital vortex rings. Play solo puzzle challenges or online with voice chat.',
    keywords: [
      'gravity golf',
      'physics golf',
      'orbital mechanics game',
      'space puzzle game',
      'gravity simulator game',
      'online multiplayer golf',
      'browser physics game',
    ],
  },
  tagline: 'Master orbital mechanics. Bend trajectories. Sink the cosmic putt.',
  overview: [
    'Gravity Golf reimagines mini golf through the lens of astrophysics. Rather than striking the ball with a club, you shape spacetime itself.',
    'Strategically position gravitational attractors, repulsor shields, directional vector boosters, vortex rings, and deflector bars to sling your orb past celestial hazards and into the galactic cup in as few placements as possible.',
    'Play solo across 9 challenging holes with par ratings or launch an online room for up to 4 astronauts with real-time WebRTC voice chat.',
  ],
  howToPlay: [
    {
      title: 'Inspect the Celestial Course',
      description:
        'Survey the starting launch vector, asteroid hazards, deflector walls, and the location of the event horizon cup.',
    },
    {
      title: 'Deploy Gravitational Fields',
      description:
        'Select Attractors to pull the ball, Repellers to push it away, Orbit Rings to establish stable loops, or Boosters for directed propulsion.',
    },
    {
      title: 'Analyze Trajectory Predictions',
      description:
        'Watch the luminous real-time trajectory guide update dynamically as you position and tweak field locations.',
    },
    {
      title: 'Launch and Capture',
      description:
        'Hit Launch to release the golf orb into your engineered gravity field. Sink the orb into the cup with the fewest fields for maximum stars.',
    },
  ],
  rules: [
    {
      title: 'Field Quota & Par Scoring',
      description:
        'Each hole has an allocated inventory of gravity objects and a target Par. Deploying fewer fields than Par yields Birdies, Eagles, and Hole-in-Ones.',
    },
    {
      title: 'Cup Capture Dynamics',
      description:
        'The cup features an accretion capture radius that pulls the orb inward, provided the ball approaches within the maximum capture speed threshold.',
    },
    {
      title: 'Hazard Absorption',
      description:
        'Colliding with dense asteroid obstacles or falling into black hole event horizons will absorb your orb and require a tee reset.',
    },
    {
      title: 'Deflector Elasticity',
      description:
        'Boundary walls and placed gravity deflector bars bounce the orb elastically with minimal kinetic energy dissipation.',
    },
  ],
  controls: [
    {
      key: '1 to 5',
      action: 'Select gravity object tool',
    },
    {
      key: 'Left Click / Drag',
      action: 'Deploy or reposition gravity field',
    },
    {
      key: 'Spacebar',
      action: 'Launch orb or reset ball to tee',
    },
    {
      key: 'R',
      action: 'Reset hole and clear placed fields',
    },
    {
      key: 'Delete / Backspace',
      action: 'Remove highlighted gravity object',
    },
  ],
  tips: [
    'Use the real-time trajectory prediction guide to test subtle millimeter adjustments before committing to a launch.',
    'Orbit rings are ideal for turning sharp 180-degree corners around solid interior barriers without losing momentum.',
    'Pair a repeller immediately behind your ball launch position with a distant attractor to slingshot through tight asteroid corridors.',
    'Hole-in-Ones are possible on several courses by relying on natural ricochet angles off perimeter deflector walls.',
  ],
  faq: [
    {
      question: 'Can I play Gravity Golf with friends online?',
      answer:
        'Yes! Create an Online Room to generate a 6-digit room code or shareable invite link. Up to 4 players can join and strategize over integrated WebRTC voice chat.',
    },
    {
      question: 'How do the different gravity objects behave?',
      answer:
        'Attractors pull inward with Newtonian gravity (F proportional to 1/r^2). Repellers push outward with equivalent force. Directional fields accelerate in a straight vector. Orbit rings induce circular vortex angular momentum, and Deflector bars provide high-restitution cosmic bounces.',
    },
    {
      question: 'How are stars awarded on each hole?',
      answer:
        'Finishing at or under Par earns a perfect 3-star rating. Completing with 1 over Par earns 2 stars, while any completed run earns at least 1 star. You can replay holes at any time to improve your record.',
    },
  ],
});

export const gravityGolfContent = gravityGolfGame.content;
export const gravityGolfDefinition = gravityGolfGame.definition;
