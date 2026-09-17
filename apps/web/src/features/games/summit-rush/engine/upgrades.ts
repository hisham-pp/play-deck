import {
  BASE_BRAKE_TORQUE,
  BASE_DRIVE_TORQUE,
  BASE_FUEL_CAPACITY,
  BASE_GRIP,
  BASE_MAX_SPIN,
  BASE_REVERSE_SPIN,
  BASE_SPRING_DAMPING,
  BASE_SPRING_K,
  BASE_SUSPENSION_MAX,
  BASE_SUSPENSION_MIN,
  BASE_SUSPENSION_REST,
} from './summit-constants';
import type { UpgradeId, UpgradeLevels, VehicleSpec } from './summit-types';

export const MAX_UPGRADE_LEVEL = 10;

export interface UpgradeInfo {
  id: UpgradeId;
  name: string;
  tagline: string;
  /** Human-readable effect at a given level, e.g. "Torque 124%". */
  describe: (level: number) => string;
  baseCost: number;
}

const pct = (value: number) => `${Math.round(value * 100)}%`;

// Per-level multipliers. Kept linear so each purchase feels the same size.
const ENGINE_TORQUE_STEP = 0.1;
const ENGINE_SPEED_STEP = 0.06;
const SUSPENSION_STEP = 0.07;
const GRIP_STEP = 0.07;
const FUEL_STEP = 0.15;

export const UPGRADES: readonly UpgradeInfo[] = [
  {
    id: 'engine',
    name: 'Engine',
    tagline: 'More pull on climbs and a higher top speed.',
    describe: (l) =>
      `Power ${pct(1 + l * ENGINE_TORQUE_STEP)} · Top speed ${pct(1 + l * ENGINE_SPEED_STEP)}`,
    baseCost: 120,
  },
  {
    id: 'suspension',
    name: 'Suspension',
    tagline: 'Softer landings, longer travel and a steadier chassis.',
    describe: (l) =>
      `Travel ${pct(1 + l * SUSPENSION_STEP)} · Damping ${pct(1 + l * SUSPENSION_STEP * 1.4)}`,
    baseCost: 100,
  },
  {
    id: 'tires',
    name: 'Tires',
    tagline: 'Extra grip for steep slopes and hard launches.',
    describe: (l) => `Grip ${pct(1 + l * GRIP_STEP)}`,
    baseCost: 110,
  },
  {
    id: 'fuel',
    name: 'Fuel Tank',
    tagline: 'Drive further between fuel cans.',
    describe: (l) => `Capacity ${Math.round(BASE_FUEL_CAPACITY * (1 + l * FUEL_STEP))} L`,
    baseCost: 90,
  },
];

export const DEFAULT_UPGRADES: UpgradeLevels = { engine: 0, suspension: 0, tires: 0, fuel: 0 };

/** Coins needed to buy the next level, or null when maxed. */
export function upgradeCost(info: UpgradeInfo, currentLevel: number): number | null {
  if (currentLevel >= MAX_UPGRADE_LEVEL) return null;
  const n = currentLevel + 1;
  return Math.round((info.baseCost * Math.pow(n, 1.55)) / 10) * 10;
}

export function buildVehicleSpec(levels: UpgradeLevels): VehicleSpec {
  const e = clampLevel(levels.engine);
  const s = clampLevel(levels.suspension);
  const t = clampLevel(levels.tires);
  const f = clampLevel(levels.fuel);
  const travel = 1 + s * SUSPENSION_STEP;
  return {
    driveTorque: BASE_DRIVE_TORQUE * (1 + e * ENGINE_TORQUE_STEP),
    maxWheelSpin: BASE_MAX_SPIN * (1 + e * ENGINE_SPEED_STEP),
    reverseSpin: BASE_REVERSE_SPIN,
    brakeTorque: BASE_BRAKE_TORQUE * (1 + e * 0.05),
    springK: BASE_SPRING_K * (1 + s * 0.03),
    springDamping: BASE_SPRING_DAMPING * (1 + s * SUSPENSION_STEP * 1.4),
    suspensionRest: BASE_SUSPENSION_REST * (1 + s * 0.02),
    suspensionMin: BASE_SUSPENSION_MIN,
    suspensionMax: BASE_SUSPENSION_MAX * travel,
    grip: BASE_GRIP * (1 + t * GRIP_STEP),
    fuelCapacity: BASE_FUEL_CAPACITY * (1 + f * FUEL_STEP),
  };
}

function clampLevel(level: number | undefined): number {
  return Math.max(0, Math.min(MAX_UPGRADE_LEVEL, Math.floor(level ?? 0)));
}

export function sanitizeUpgrades(raw: Partial<UpgradeLevels> | undefined): UpgradeLevels {
  return {
    engine: clampLevel(raw?.engine),
    suspension: clampLevel(raw?.suspension),
    tires: clampLevel(raw?.tires),
    fuel: clampLevel(raw?.fuel),
  };
}
