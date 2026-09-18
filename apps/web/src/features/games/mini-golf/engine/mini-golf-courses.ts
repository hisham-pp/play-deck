import type { HoleDefinition, WallSegment } from './mini-golf-types';

/** Helper to generate a rectangular wall border */
function createBoxWalls(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  restitution = 0.78,
): WallSegment[] {
  return [
    { p1: { x: minX, y: minY }, p2: { x: maxX, y: minY }, restitution }, // Top
    { p1: { x: maxX, y: minY }, p2: { x: maxX, y: maxY }, restitution }, // Right
    { p1: { x: maxX, y: maxY }, p2: { x: minX, y: maxY }, restitution }, // Bottom
    { p1: { x: minX, y: maxY }, p2: { x: minX, y: minY }, restitution }, // Left
  ];
}

export const MINI_GOLF_COURSES: HoleDefinition[] = [
  // Hole 1: The Warmup (Par 2)
  {
    id: 1,
    name: 'The Warmup',
    par: 2,
    tee: { x: 120, y: 300 },
    cup: { x: 680, y: 300, radius: 14 },
    walls: [
      ...createBoxWalls(60, 160, 740, 440),
      // Angled kicker wall in center
      { p1: { x: 400, y: 220 }, p2: { x: 440, y: 260 }, restitution: 0.8 },
      { p1: { x: 400, y: 380 }, p2: { x: 440, y: 340 }, restitution: 0.8 },
    ],
    sandTraps: [],
    waterHazards: [],
    bumpers: [{ x: 400, y: 300, radius: 18, impulse: 320 }],
    rotators: [],
    boosters: [],
    portals: [],
  },

  // Hole 2: Sand Trap Dogleg (Par 3)
  {
    id: 2,
    name: 'Bunker Bend',
    par: 3,
    tee: { x: 140, y: 460 },
    cup: { x: 660, y: 160, radius: 14 },
    walls: [
      ...createBoxWalls(60, 80, 740, 520),
      // Dogleg divider wall
      { p1: { x: 380, y: 240 }, p2: { x: 380, y: 520 }, restitution: 0.76 },
    ],
    sandTraps: [
      { x: 390, y: 100, width: 140, height: 160 },
      { x: 200, y: 360, width: 100, height: 80 },
    ],
    waterHazards: [],
    bumpers: [{ x: 580, y: 360, radius: 20, impulse: 350 }],
    rotators: [],
    boosters: [],
    portals: [],
  },

  // Hole 3: Pinball Alley (Par 3)
  {
    id: 3,
    name: 'Pinball Alley',
    par: 3,
    tee: { x: 120, y: 300 },
    cup: { x: 680, y: 300, radius: 14 },
    walls: [
      ...createBoxWalls(60, 100, 740, 500),
      // Funnel entry
      { p1: { x: 220, y: 100 }, p2: { x: 260, y: 180 }, restitution: 0.8 },
      { p1: { x: 220, y: 500 }, p2: { x: 260, y: 420 }, restitution: 0.8 },
      // Green exit
      { p1: { x: 560, y: 180 }, p2: { x: 600, y: 100 }, restitution: 0.8 },
      { p1: { x: 560, y: 420 }, p2: { x: 600, y: 500 }, restitution: 0.8 },
    ],
    sandTraps: [{ x: 360, y: 250, width: 80, height: 100 }],
    waterHazards: [],
    bumpers: [
      { x: 320, y: 180, radius: 24, impulse: 420 },
      { x: 320, y: 420, radius: 24, impulse: 420 },
      { x: 480, y: 180, radius: 24, impulse: 420 },
      { x: 480, y: 420, radius: 24, impulse: 420 },
      { x: 400, y: 300, radius: 18, impulse: 380 },
    ],
    rotators: [],
    boosters: [],
    portals: [],
  },

  // Hole 4: The Windmill (Par 3)
  {
    id: 4,
    name: 'The Windmill',
    par: 3,
    tee: { x: 120, y: 300 },
    cup: { x: 680, y: 300, radius: 14 },
    walls: [
      ...createBoxWalls(60, 100, 740, 500),
      // Dividing tower walls leaving a center archway
      { p1: { x: 400, y: 100 }, p2: { x: 400, y: 220 }, restitution: 0.75 },
      { p1: { x: 400, y: 380 }, p2: { x: 400, y: 500 }, restitution: 0.75 },
    ],
    sandTraps: [
      { x: 520, y: 140, width: 80, height: 100 },
      { x: 520, y: 360, width: 80, height: 100 },
    ],
    waterHazards: [],
    bumpers: [],
    rotators: [
      {
        x: 400,
        y: 300,
        length: 150,
        width: 14,
        angle: 0,
        speed: 1.4, // rotating windmill sweep
      },
    ],
    boosters: [],
    portals: [],
  },

  // Hole 5: Island Green (Par 3)
  {
    id: 5,
    name: 'Island Green',
    par: 3,
    tee: { x: 120, y: 300 },
    cup: { x: 640, y: 300, radius: 14 },
    walls: [
      ...createBoxWalls(60, 80, 740, 520),
      // Bridge borders
      { p1: { x: 260, y: 260 }, p2: { x: 500, y: 260 }, restitution: 0.8 },
      { p1: { x: 260, y: 340 }, p2: { x: 500, y: 340 }, restitution: 0.8 },
    ],
    sandTraps: [{ x: 680, y: 240, width: 40, height: 120 }],
    waterHazards: [
      // Surrounding water moat above and below the bridge
      { x: 260, y: 80, width: 240, height: 178 },
      { x: 260, y: 342, width: 240, height: 178 },
      { x: 500, y: 80, width: 240, height: 120 },
      { x: 500, y: 400, width: 240, height: 120 },
    ],
    bumpers: [{ x: 230, y: 300, radius: 18, impulse: 360 }],
    rotators: [],
    boosters: [],
    portals: [],
  },

  // Hole 6: Split Fairways (Par 4)
  {
    id: 6,
    name: 'Split Fairways',
    par: 4,
    tee: { x: 100, y: 300 },
    cup: { x: 700, y: 300, radius: 14 },
    walls: [
      ...createBoxWalls(50, 70, 750, 530),
      // Central island divider
      { p1: { x: 260, y: 220 }, p2: { x: 520, y: 220 }, restitution: 0.8 },
      { p1: { x: 520, y: 220 }, p2: { x: 520, y: 380 }, restitution: 0.8 },
      { p1: { x: 520, y: 380 }, p2: { x: 260, y: 380 }, restitution: 0.8 },
      { p1: { x: 260, y: 380 }, p2: { x: 260, y: 220 }, restitution: 0.8 },
    ],
    sandTraps: [
      { x: 320, y: 90, width: 140, height: 60 },
      { x: 600, y: 220, width: 60, height: 160 },
    ],
    waterHazards: [{ x: 300, y: 250, width: 180, height: 100 }],
    bumpers: [
      { x: 180, y: 160, radius: 20, impulse: 360 },
      { x: 180, y: 440, radius: 20, impulse: 360 },
    ],
    rotators: [],
    boosters: [
      // Speed ramp on lower path
      {
        x: 320,
        y: 430,
        width: 120,
        height: 50,
        direction: { x: 1, y: 0 },
        force: 320,
      },
    ],
    portals: [],
  },

  // Hole 7: Quantum Gate (Par 3)
  {
    id: 7,
    name: 'Quantum Gate',
    par: 3,
    tee: { x: 120, y: 420 },
    cup: { x: 660, y: 160, radius: 14 },
    walls: [
      ...createBoxWalls(60, 80, 740, 520),
      // Wall blocking direct line of sight to cup
      { p1: { x: 240, y: 80 }, p2: { x: 240, y: 360 }, restitution: 0.8 },
      { p1: { x: 480, y: 240 }, p2: { x: 480, y: 520 }, restitution: 0.8 },
    ],
    sandTraps: [{ x: 540, y: 100, width: 70, height: 120 }],
    waterHazards: [],
    bumpers: [{ x: 160, y: 200, radius: 22, impulse: 380 }],
    rotators: [],
    boosters: [],
    portals: [
      {
        entry: { x: 120, y: 160 },
        exit: { x: 400, y: 440 },
        radius: 26,
        color: '#38bdf8',
      },
    ],
  },

  // Hole 8: The Slalom (Par 4)
  {
    id: 8,
    name: 'The Slalom',
    par: 4,
    tee: { x: 100, y: 160 },
    cup: { x: 680, y: 440, radius: 14 },
    walls: [
      ...createBoxWalls(50, 70, 750, 530),
      // Slalom baffles
      { p1: { x: 260, y: 70 }, p2: { x: 260, y: 360 }, restitution: 0.8 },
      { p1: { x: 460, y: 240 }, p2: { x: 460, y: 530 }, restitution: 0.8 },
    ],
    sandTraps: [
      { x: 300, y: 400, width: 100, height: 80 },
      { x: 500, y: 120, width: 100, height: 80 },
    ],
    waterHazards: [],
    bumpers: [
      { x: 360, y: 200, radius: 22, impulse: 380 },
      { x: 560, y: 340, radius: 22, impulse: 380 },
    ],
    rotators: [
      {
        x: 360,
        y: 200,
        length: 80,
        width: 10,
        angle: 0.5,
        speed: -1.8,
      },
    ],
    boosters: [],
    portals: [],
  },

  // Hole 9: The Grand Gauntlet (Par 5)
  {
    id: 9,
    name: 'The Grand Gauntlet',
    par: 5,
    tee: { x: 100, y: 460 },
    cup: { x: 690, y: 130, radius: 14 },
    walls: [
      ...createBoxWalls(50, 60, 750, 540),
      // Multi-stage partitions
      { p1: { x: 220, y: 220 }, p2: { x: 220, y: 540 }, restitution: 0.8 },
      { p1: { x: 440, y: 60 }, p2: { x: 440, y: 380 }, restitution: 0.8 },
      { p1: { x: 600, y: 240 }, p2: { x: 600, y: 540 }, restitution: 0.8 },
    ],
    sandTraps: [
      { x: 100, y: 180, width: 80, height: 100 },
      { x: 480, y: 440, width: 80, height: 70 },
      { x: 630, y: 200, width: 80, height: 50 },
    ],
    waterHazards: [{ x: 260, y: 400, width: 140, height: 100 }],
    bumpers: [
      { x: 120, y: 100, radius: 22, impulse: 400 },
      { x: 330, y: 180, radius: 22, impulse: 420 },
      { x: 530, y: 300, radius: 22, impulse: 420 },
    ],
    rotators: [
      {
        x: 330,
        y: 280,
        length: 120,
        width: 12,
        angle: 0,
        speed: 2.0, // fast spinning hazard gate
      },
    ],
    boosters: [
      {
        x: 230,
        y: 80,
        width: 90,
        height: 60,
        direction: { x: 1, y: 0.2 },
        force: 340,
      },
    ],
    portals: [],
  },
];
