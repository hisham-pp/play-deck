import type { CourseDefinition } from '../types/gravity-shift.types';

export const COURSE_NEON_CIRCUIT: CourseDefinition = {
  id: 'neon-circuit',
  name: 'Neon Circuit',
  description: 'An introductory orbital loop with vertical shafts and bounce pads.',
  worldBounds: { width: 2400, height: 1600 },
  spawnPoint: { x: 80, y: 1380 },
  initialGravity: 'down',
  elements: [
    // Outer boundaries
    { id: 'bound-bottom', type: 'platform', x: 0, y: 1550, width: 2400, height: 50 },
    { id: 'bound-top', type: 'platform', x: 0, y: 0, width: 2400, height: 50 },
    { id: 'bound-left', type: 'platform', x: 0, y: 0, width: 50, height: 1600 },
    { id: 'bound-right', type: 'platform', x: 2350, y: 0, width: 50, height: 1600 },

    // Starting Sector (Bottom Track)
    { id: 'start-floor', type: 'platform', x: 50, y: 1450, width: 650, height: 40 },
    { id: 'start-hazard-1', type: 'hazard', x: 380, y: 1430, width: 60, height: 20 },
    { id: 'start-bounce', type: 'bounce-pad', x: 620, y: 1435, width: 70, height: 15 },

    // First Checkpoint & Shift Corridor
    { id: 'cp-1', type: 'checkpoint', x: 700, y: 1350, width: 50, height: 100, order: 1 },
    { id: 'platform-1', type: 'platform', x: 750, y: 1300, width: 400, height: 30 },
    { id: 'energy-1', type: 'energy-core', x: 920, y: 1250, width: 30, height: 30 },

    // Right Vertical Climb (Run on Right Wall or Shift Left)
    { id: 'vert-shaft-right', type: 'platform', x: 1300, y: 700, width: 40, height: 650 },
    { id: 'vert-shaft-left', type: 'platform', x: 1150, y: 700, width: 40, height: 550 },
    { id: 'vert-hazard-1', type: 'hazard', x: 1190, y: 950, width: 40, height: 20 },
    { id: 'cp-2', type: 'checkpoint', x: 1210, y: 720, width: 80, height: 40, order: 2 },

    // High Ceiling Runner (Gravity Inverted or Upwards)
    { id: 'roof-run-1', type: 'platform', x: 700, y: 350, width: 550, height: 30 },
    { id: 'roof-hazard-1', type: 'hazard', x: 900, y: 380, width: 80, height: 20 },
    { id: 'energy-2', type: 'energy-core', x: 1050, y: 400, width: 30, height: 30 },
    { id: 'cp-3', type: 'checkpoint', x: 650, y: 300, width: 50, height: 80, order: 3 },

    // Descent & Final Stretch
    { id: 'desc-platform-1', type: 'platform', x: 300, y: 550, width: 300, height: 30 },
    { id: 'desc-bounce-1', type: 'bounce-pad', x: 320, y: 535, width: 60, height: 15 },
    { id: 'desc-platform-2', type: 'platform', x: 150, y: 850, width: 350, height: 30 },
    { id: 'desc-hazard-1', type: 'hazard', x: 280, y: 830, width: 60, height: 20 },
    { id: 'finish-platform', type: 'platform', x: 100, y: 1150, width: 400, height: 30 },
    { id: 'finish-neon', type: 'finish', x: 350, y: 1070, width: 70, height: 80 },
  ],
};

export const COURSE_GRAVITY_WELL: CourseDefinition = {
  id: 'gravity-well',
  name: 'Gravity Well',
  description: 'Multi-tiered chamber with hazardous laser grids and vertical running corridors.',
  worldBounds: { width: 2800, height: 1800 },
  spawnPoint: { x: 100, y: 1500 },
  initialGravity: 'down',
  elements: [
    // Outer bounds
    { id: 'gw-bound-bottom', type: 'platform', x: 0, y: 1750, width: 2800, height: 50 },
    { id: 'gw-bound-top', type: 'platform', x: 0, y: 0, width: 2800, height: 50 },
    { id: 'gw-bound-left', type: 'platform', x: 0, y: 0, width: 50, height: 1800 },
    { id: 'gw-bound-right', type: 'platform', x: 2750, y: 0, width: 50, height: 1800 },

    // Base Chamber
    { id: 'gw-floor-1', type: 'platform', x: 50, y: 1600, width: 700, height: 40 },
    { id: 'gw-hazard-1', type: 'hazard', x: 400, y: 1580, width: 80, height: 20 },
    { id: 'gw-cp-1', type: 'checkpoint', x: 680, y: 1500, width: 60, height: 100, order: 1 },

    // Tier 1 Ascension
    { id: 'gw-bounce-1', type: 'bounce-pad', x: 780, y: 1585, width: 80, height: 15 },
    { id: 'gw-plat-tier1', type: 'platform', x: 900, y: 1350, width: 500, height: 30 },
    { id: 'gw-energy-1', type: 'energy-core', x: 1100, y: 1300, width: 30, height: 30 },
    { id: 'gw-hazard-2', type: 'hazard', x: 1250, y: 1330, width: 70, height: 20 },

    // Central Shift Well
    { id: 'gw-wall-left', type: 'platform', x: 1500, y: 600, width: 40, height: 800 },
    { id: 'gw-wall-right', type: 'platform', x: 1700, y: 600, width: 40, height: 800 },
    { id: 'gw-cp-2', type: 'checkpoint', x: 1550, y: 950, width: 140, height: 50, order: 2 },

    // Upper Corridor
    { id: 'gw-roof-track', type: 'platform', x: 1300, y: 350, width: 900, height: 30 },
    { id: 'gw-roof-hazard', type: 'hazard', x: 1650, y: 380, width: 120, height: 20 },
    { id: 'gw-energy-2', type: 'energy-core', x: 1900, y: 400, width: 30, height: 30 },
    { id: 'gw-cp-3', type: 'checkpoint', x: 2150, y: 300, width: 60, height: 80, order: 3 },

    // East Fall & Slalom
    { id: 'gw-plat-east-1', type: 'platform', x: 2300, y: 600, width: 350, height: 30 },
    { id: 'gw-plat-east-2', type: 'platform', x: 2100, y: 950, width: 350, height: 30 },
    { id: 'gw-plat-east-3', type: 'platform', x: 2300, y: 1300, width: 350, height: 30 },
    { id: 'gw-bounce-east', type: 'bounce-pad', x: 2450, y: 1285, width: 80, height: 15 },

    // Final Stretch & Portal
    { id: 'gw-finish-floor', type: 'platform', x: 1800, y: 1600, width: 500, height: 40 },
    { id: 'gw-finish', type: 'finish', x: 1950, y: 1520, width: 80, height: 80 },
  ],
};

export const COURSE_HYPER_VORTEX: CourseDefinition = {
  id: 'hyper-vortex',
  name: 'Hyper Vortex',
  description:
    'High-speed multidirectional labyrinth with pulsing hazards and continuous rotation.',
  worldBounds: { width: 3200, height: 2000 },
  spawnPoint: { x: 120, y: 1700 },
  initialGravity: 'down',
  elements: [
    // Outer walls
    { id: 'hv-b-bot', type: 'platform', x: 0, y: 1950, width: 3200, height: 50 },
    { id: 'hv-b-top', type: 'platform', x: 0, y: 0, width: 3200, height: 50 },
    { id: 'hv-b-left', type: 'platform', x: 0, y: 0, width: 50, height: 2000 },
    { id: 'hv-b-right', type: 'platform', x: 3150, y: 0, width: 50, height: 2000 },

    // Launch zone
    { id: 'hv-p-1', type: 'platform', x: 50, y: 1800, width: 600, height: 40 },
    { id: 'hv-h-1', type: 'hazard', x: 350, y: 1780, width: 80, height: 20 },
    { id: 'hv-bp-1', type: 'bounce-pad', x: 550, y: 1785, width: 80, height: 15 },
    { id: 'hv-cp-1', type: 'checkpoint', x: 620, y: 1700, width: 60, height: 100, order: 1 },

    // Angle Corridor 1
    { id: 'hv-p-2', type: 'platform', x: 750, y: 1450, width: 500, height: 30 },
    { id: 'hv-ec-1', type: 'energy-core', x: 950, y: 1400, width: 30, height: 30 },
    { id: 'hv-h-2', type: 'hazard', x: 1050, y: 1430, width: 80, height: 20 },

    // Vertical Vortex Tower
    { id: 'hv-tower-l', type: 'platform', x: 1350, y: 500, width: 40, height: 1100 },
    { id: 'hv-tower-r', type: 'platform', x: 1600, y: 500, width: 40, height: 1100 },
    { id: 'hv-cp-2', type: 'checkpoint', x: 1400, y: 1000, width: 190, height: 40, order: 2 },
    { id: 'hv-tower-h1', type: 'hazard', x: 1450, y: 750, width: 80, height: 25 },

    // Apex Corridor
    { id: 'hv-apex-floor', type: 'platform', x: 1300, y: 300, width: 1100, height: 30 },
    { id: 'hv-ec-2', type: 'energy-core', x: 1800, y: 250, width: 30, height: 30 },
    { id: 'hv-apex-h1', type: 'hazard', x: 2000, y: 280, width: 90, height: 20 },
    { id: 'hv-cp-3', type: 'checkpoint', x: 2350, y: 220, width: 60, height: 80, order: 3 },

    // Fast Drop Zone
    { id: 'hv-drop-p1', type: 'platform', x: 2500, y: 650, width: 350, height: 30 },
    { id: 'hv-drop-p2', type: 'platform', x: 2250, y: 1050, width: 350, height: 30 },
    { id: 'hv-drop-bp', type: 'bounce-pad', x: 2350, y: 1035, width: 70, height: 15 },
    { id: 'hv-drop-p3', type: 'platform', x: 2550, y: 1450, width: 350, height: 30 },
    { id: 'hv-drop-h', type: 'hazard', x: 2700, y: 1430, width: 90, height: 20 },

    // Finish Arena
    { id: 'hv-finish-floor', type: 'platform', x: 1800, y: 1800, width: 700, height: 40 },
    { id: 'hv-finish', type: 'finish', x: 2200, y: 1720, width: 90, height: 80 },
  ],
};

export const GRAVITY_COURSES: CourseDefinition[] = [
  COURSE_NEON_CIRCUIT,
  COURSE_GRAVITY_WELL,
  COURSE_HYPER_VORTEX,
];

export function getCourseById(id: string): CourseDefinition {
  const found = GRAVITY_COURSES.find((c) => c.id === id);
  return found ?? COURSE_NEON_CIRCUIT;
}
