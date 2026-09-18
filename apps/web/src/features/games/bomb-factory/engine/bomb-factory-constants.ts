import type {
  BlueprintChannel,
  BombFactoryDifficulty,
  PartDefinition,
  PartMaterial,
  StationDefinition,
  ToolDefinition,
} from '../types/bomb-factory.types';

export const GAME_ID = 'bomb-factory';
export const CHANNEL_NAMESPACE = 'bomb-factory';

export const MIN_SEATS = 2;
export const MAX_SEATS = 6;

export const MATERIAL_COPPER: PartMaterial = 'copper';
export const MATERIAL_CERAMIC: PartMaterial = 'ceramic';
export const MATERIAL_POLYMER: PartMaterial = 'polymer';
export const MATERIAL_ALLOY: PartMaterial = 'alloy';

export const MATERIALS: PartMaterial[] = [
  MATERIAL_COPPER,
  MATERIAL_CERAMIC,
  MATERIAL_POLYMER,
  MATERIAL_ALLOY,
];

export const MATERIAL_LABELS: Record<PartMaterial, string> = {
  copper: 'Copper',
  ceramic: 'Ceramic',
  polymer: 'Polymer',
  alloy: 'Alloy',
};

/** Every part the shop floor can stock. A machine uses a subset of these. */
export const PART_CATALOG: PartDefinition[] = [
  { id: 'coolant-coil', name: 'Coolant Coil', glyph: '🌀', material: MATERIAL_COPPER },
  { id: 'grip-clamp', name: 'Grip Clamp', glyph: '🗜️', material: MATERIAL_COPPER },
  { id: 'circuit-board', name: 'Circuit Board', glyph: '🧩', material: MATERIAL_COPPER },
  { id: 'ignition-plug', name: 'Ignition Plug', glyph: '⚡', material: MATERIAL_CERAMIC },
  { id: 'fuse-rod', name: 'Fuse Rod', glyph: '🧨', material: MATERIAL_CERAMIC },
  { id: 'optic-lens', name: 'Optic Lens', glyph: '🔭', material: MATERIAL_CERAMIC },
  { id: 'signal-relay', name: 'Signal Relay', glyph: '📡', material: MATERIAL_POLYMER },
  { id: 'ballast-cell', name: 'Ballast Cell', glyph: '🔋', material: MATERIAL_POLYMER },
  { id: 'vent-fan', name: 'Vent Fan', glyph: '🌪️', material: MATERIAL_POLYMER },
  { id: 'pressure-valve', name: 'Pressure Valve', glyph: '🎛️', material: MATERIAL_ALLOY },
  { id: 'torque-gear', name: 'Torque Gear', glyph: '⚙️', material: MATERIAL_ALLOY },
  { id: 'servo-arm', name: 'Servo Arm', glyph: '🦾', material: MATERIAL_ALLOY },
];

const STATION_ROWS = ['A', 'B', 'C', 'D'];
const STATION_COLUMNS = [1, 2, 3];

/** Bays are laid out as a grid so the routing channel has something to point at. */
export const STATION_CATALOG: StationDefinition[] = STATION_ROWS.flatMap((row) =>
  STATION_COLUMNS.map((column) => ({
    id: `${row}${column}`,
    label: `Bay ${row}${column}`,
    row,
    column,
  })),
);

export const TOOL_CATALOG: ToolDefinition[] = [
  { id: 'wrench', name: 'Wrench', glyph: '🔧' },
  { id: 'torch', name: 'Torch', glyph: '🔥' },
  { id: 'mallet', name: 'Mallet', glyph: '🔨' },
  { id: 'probe', name: 'Probe', glyph: '📏' },
];

export const CHANNELS: BlueprintChannel[] = ['order', 'routing', 'calibration', 'safety'];

export const CHANNEL_LABELS: Record<BlueprintChannel, string> = {
  order: 'Run Sheet',
  routing: 'Bay Manifest',
  calibration: 'Calibration Log',
  safety: 'Safety Notice',
};

export const CHANNEL_ROLES: Record<BlueprintChannel, string> = {
  order: 'Foreman',
  routing: 'Fitter',
  calibration: 'Technician',
  safety: 'Safety Officer',
};

export const CHANNEL_BLURBS: Record<BlueprintChannel, string> = {
  order: 'You alone know which part goes in next. Call the run sheet out loud.',
  routing: 'You alone know which bay each part belongs in. Read the manifest out loud.',
  calibration: 'You alone know the dial setting each part needs. Read the log out loud.',
  safety: 'You alone know which tools are lethal on which material. Warn them in time.',
};

export interface DifficultyTier {
  id: BombFactoryDifficulty;
  label: string;
  summary: string;
  machineNames: string[];
  /** Steps in each machine of the shift, one entry per machine. */
  stepsPerMachine: number[];
  maxDial: number;
  toolCount: number;
  timeLimitSeconds: number;
  faultPenaltySeconds: number;
}

export const DIFFICULTY_TIERS: DifficultyTier[] = [
  {
    id: 'trainee',
    label: 'Trainee Line',
    summary: 'Short builds, a forgiving clock and a small dial range. Learn the calls.',
    machineNames: ['Igniter Mk I', 'Thermal Regulator', 'Pulse Condenser'],
    stepsPerMachine: [4, 5, 6],
    maxDial: 4,
    toolCount: 3,
    timeLimitSeconds: 180,
    faultPenaltySeconds: 8,
  },
  {
    id: 'standard',
    label: 'Standard Shift',
    summary: 'Four machines, a wider dial and a fourth tool on the rack.',
    machineNames: ['Igniter Mk II', 'Coolant Stack', 'Pulse Condenser', 'Fission Core'],
    stepsPerMachine: [5, 6, 7, 8],
    maxDial: 6,
    toolCount: 4,
    timeLimitSeconds: 165,
    faultPenaltySeconds: 12,
  },
  {
    id: 'overclocked',
    label: 'Overclocked',
    summary: 'Five machines, ten-step builds and a clock that punishes every guess.',
    machineNames: [
      'Igniter Mk III',
      'Coolant Stack',
      'Arc Cascade',
      'Fission Core',
      'Doomsday Clock',
    ],
    stepsPerMachine: [6, 7, 8, 9, 10],
    maxDial: 8,
    toolCount: 4,
    timeLimitSeconds: 150,
    faultPenaltySeconds: 16,
  },
];

export const DEFAULT_DIFFICULTY: BombFactoryDifficulty = 'standard';

export const SCORE_PER_MACHINE = 1000;
export const SCORE_PER_SECOND_LEFT = 10;
export const SCORE_PER_FAULT = -60;

/** How long a submission waits for every channel owner before it is voided. */
export const VERDICT_TIMEOUT_MS = 6000;

export const PHASE_ASSEMBLY = 'assembly';
export const PHASE_BRIEFING = 'briefing';
export const PHASE_MACHINE_CLEARED = 'machine-cleared';
export const PHASE_MACHINE_FAILED = 'machine-failed';
export const PHASE_SHIFT_COMPLETE = 'shift-complete';

export function tierFor(difficulty: BombFactoryDifficulty): DifficultyTier {
  return DIFFICULTY_TIERS.find((tier) => tier.id === difficulty) ?? DIFFICULTY_TIERS[1];
}

export function partById(partId: string): PartDefinition | undefined {
  return PART_CATALOG.find((part) => part.id === partId);
}

export function stationById(stationId: string): StationDefinition | undefined {
  return STATION_CATALOG.find((station) => station.id === stationId);
}

export function toolById(toolId: string): ToolDefinition | undefined {
  return TOOL_CATALOG.find((tool) => tool.id === toolId);
}
