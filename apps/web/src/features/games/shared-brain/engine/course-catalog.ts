import type { CourseDefinition } from '../types/shared-brain.types';

export const COURSES_CATALOG: CourseDefinition[] = [
  {
    id: 'course-1-synaptic-gap',
    name: 'The Synaptic Gap',
    number: 1,
    description:
      'Learn the rhythm of dual control. Navigator guides the pace while Motor handles the leaps over neural chasms.',
    parSeconds: 30,
    spawnPoint: { x: 80, y: 380 },
    worldBounds: { width: 1600, height: 600 },
    elements: [
      // Starting floor
      { id: 'floor-1', type: 'platform', x: 0, y: 450, width: 340, height: 150 },
      // Token 1
      { id: 'tok-1', type: 'token', x: 220, y: 400, width: 22, height: 22, value: 10 },
      // First gap to middle platform
      { id: 'plat-2', type: 'platform', x: 420, y: 450, width: 300, height: 150 },
      // Token 2
      { id: 'tok-2', type: 'token', x: 550, y: 400, width: 22, height: 22, value: 10 },
      // Checkpoint
      { id: 'chk-1', type: 'checkpoint', x: 620, y: 450, width: 30, height: 40, active: true },
      // Elevated step
      { id: 'plat-3', type: 'platform', x: 800, y: 390, width: 260, height: 210 },
      // Token 3
      { id: 'tok-3', type: 'token', x: 920, y: 340, width: 22, height: 22, value: 10 },
      // Finish platform
      { id: 'plat-4', type: 'platform', x: 1140, y: 450, width: 460, height: 150 },
      // Exit portal
      { id: 'goal-1', type: 'goal', x: 1400, y: 390, width: 44, height: 60 },
    ],
  },
  {
    id: 'course-2-cortex-canyon',
    name: 'Cortex Canyon',
    number: 2,
    description:
      'Navigate vertical rock faces, bounce pads, and a secure blast door that requires Motor to throw the lever.',
    parSeconds: 45,
    spawnPoint: { x: 80, y: 420 },
    worldBounds: { width: 2000, height: 700 },
    elements: [
      // Starting base
      { id: 'c2-floor-1', type: 'platform', x: 0, y: 500, width: 360, height: 200 },
      // Bouncy Pad 1
      { id: 'c2-bounce-1', type: 'bouncy-pad', x: 260, y: 488, width: 48, height: 12 },
      // High ledge
      { id: 'c2-plat-high', type: 'platform', x: 380, y: 340, width: 280, height: 40 },
      // Token on high ledge
      { id: 'c2-tok-1', type: 'token', x: 450, y: 290, width: 22, height: 22, value: 10 },
      // Lever to unlock blast door
      {
        id: 'c2-lever-1',
        type: 'switch-lever',
        x: 580,
        y: 300,
        width: 32,
        height: 40,
        linkedDoorId: 'c2-door-1',
        active: false,
      },
      // Lower canyon floor with laser gate hazard
      { id: 'c2-floor-low', type: 'platform', x: 400, y: 620, width: 450, height: 80 },
      { id: 'c2-laser-1', type: 'laser-gate', x: 700, y: 590, width: 24, height: 30, active: true },
      // Checkpoint 1
      { id: 'c2-chk-1', type: 'checkpoint', x: 920, y: 480, width: 30, height: 40, active: true },
      { id: 'c2-plat-mid', type: 'platform', x: 890, y: 480, width: 320, height: 220 },
      // Blast Door (locked until lever thrown)
      { id: 'c2-door-1', type: 'door', x: 1100, y: 360, width: 26, height: 120, active: true },
      // Beyond door
      { id: 'c2-plat-end', type: 'platform', x: 1200, y: 480, width: 700, height: 220 },
      { id: 'c2-tok-2', type: 'token', x: 1350, y: 430, width: 22, height: 22, value: 10 },
      { id: 'c2-tok-3', type: 'token', x: 1520, y: 430, width: 22, height: 22, value: 10 },
      // Goal
      { id: 'c2-goal', type: 'goal', x: 1750, y: 420, width: 44, height: 60 },
    ],
  },
  {
    id: 'course-3-neuro-nexus',
    name: 'Neuro-Nexus',
    number: 3,
    description:
      'High-speed synchrony test across floating synaptic nodes, rapid bounce pads, and timed laser grids.',
    parSeconds: 60,
    spawnPoint: { x: 80, y: 380 },
    worldBounds: { width: 2400, height: 700 },
    elements: [
      // Starting node
      { id: 'c3-floor-1', type: 'platform', x: 0, y: 460, width: 300, height: 240 },
      { id: 'c3-tok-1', type: 'token', x: 180, y: 410, width: 22, height: 22, value: 10 },
      // Bounce pad into chain
      { id: 'c3-bounce-1', type: 'bouncy-pad', x: 230, y: 448, width: 48, height: 12 },
      // High floating node 1
      { id: 'c3-node-1', type: 'platform', x: 380, y: 280, width: 180, height: 30 },
      { id: 'c3-tok-2', type: 'token', x: 450, y: 230, width: 22, height: 22, value: 10 },
      // Node 2
      { id: 'c3-node-2', type: 'platform', x: 660, y: 320, width: 180, height: 30 },
      { id: 'c3-tok-3', type: 'token', x: 720, y: 270, width: 22, height: 22, value: 10 },
      // Checkpoint
      { id: 'c3-chk-1', type: 'checkpoint', x: 960, y: 440, width: 30, height: 40, active: true },
      { id: 'c3-plat-mid', type: 'platform', x: 920, y: 440, width: 280, height: 260 },
      // Laser gauntlet
      {
        id: 'c3-laser-1',
        type: 'laser-gate',
        x: 1260,
        y: 410,
        width: 24,
        height: 30,
        active: true,
      },
      { id: 'c3-plat-step1', type: 'platform', x: 1240, y: 440, width: 200, height: 260 },
      // Switch for exit
      {
        id: 'c3-lever-1',
        type: 'switch-lever',
        x: 1380,
        y: 400,
        width: 32,
        height: 40,
        linkedDoorId: 'c3-door-1',
        active: false,
      },
      // Bounce pad 2
      { id: 'c3-bounce-2', type: 'bouncy-pad', x: 1470, y: 428, width: 48, height: 12 },
      { id: 'c3-node-3', type: 'platform', x: 1560, y: 260, width: 220, height: 30 },
      { id: 'c3-tok-4', type: 'token', x: 1640, y: 210, width: 22, height: 22, value: 10 },
      // Exit Door
      { id: 'c3-door-1', type: 'door', x: 1850, y: 340, width: 26, height: 120, active: true },
      // Final platform
      { id: 'c3-plat-final', type: 'platform', x: 1840, y: 460, width: 500, height: 240 },
      // Goal
      { id: 'c3-goal', type: 'goal', x: 2150, y: 400, width: 44, height: 60 },
    ],
  },
];
