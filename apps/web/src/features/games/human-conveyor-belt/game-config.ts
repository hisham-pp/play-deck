export const HUMAN_CONVEYOR_BELT_LAYOUTS = [
  { name: 'Launch lane', speed: 1.1, risk: 'Low', target: 24 },
  { name: 'Tilt bridge', speed: 1.4, risk: 'Medium', target: 32 },
  { name: 'Drop chute', speed: 1.8, risk: 'High', target: 40 },
  { name: 'Rumble run', speed: 2.2, risk: 'Extreme', target: 48 },
];

export const HUMAN_CONVEYOR_BELT_OBJECTS = [
  { type: 'Crate', value: 12, weight: 'Heavy' },
  { type: 'Orb', value: 9, weight: 'Light' },
  { type: 'Bottle', value: 7, weight: 'Fragile' },
  { type: 'Cube', value: 11, weight: 'Medium' },
];
