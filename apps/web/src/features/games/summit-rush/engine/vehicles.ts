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
import type { VehicleSpec } from './summit-types';

export interface VehicleDefinition {
  id: string;
  name: string;
  description: string;
  unlockCost: number;
  color: string;
  baseSpec: VehicleSpec;
  stats: {
    speed: number;
    acceleration: number;
    handling: number;
    grip: number;
    stability: number;
  };
}

export const VEHICLES: readonly VehicleDefinition[] = [
  {
    id: 'buggy',
    name: 'Dune Buggy',
    description: 'The standard all-rounder. Balanced and reliable.',
    unlockCost: 0,
    color: '#14b8a6', // Teal
    baseSpec: {
      driveTorque: BASE_DRIVE_TORQUE,
      maxWheelSpin: BASE_MAX_SPIN,
      reverseSpin: BASE_REVERSE_SPIN,
      brakeTorque: BASE_BRAKE_TORQUE,
      springK: BASE_SPRING_K,
      springDamping: BASE_SPRING_DAMPING,
      suspensionRest: BASE_SUSPENSION_REST,
      suspensionMin: BASE_SUSPENSION_MIN,
      suspensionMax: BASE_SUSPENSION_MAX,
      grip: BASE_GRIP,
      fuelCapacity: BASE_FUEL_CAPACITY,
    },
    stats: {
      speed: 5,
      acceleration: 5,
      handling: 5,
      grip: 5,
      stability: 5,
    },
  },
  {
    id: 'climber',
    name: 'Mountain Climber',
    description: 'Heavy and slow, but grips like a mountain goat with incredible torque.',
    unlockCost: 500,
    color: '#f59e0b', // Amber
    baseSpec: {
      driveTorque: BASE_DRIVE_TORQUE * 1.3,
      maxWheelSpin: BASE_MAX_SPIN * 0.8,
      reverseSpin: BASE_REVERSE_SPIN,
      brakeTorque: BASE_BRAKE_TORQUE * 1.2,
      springK: BASE_SPRING_K * 1.1,
      springDamping: BASE_SPRING_DAMPING * 1.2,
      suspensionRest: BASE_SUSPENSION_REST * 1.1,
      suspensionMin: BASE_SUSPENSION_MIN,
      suspensionMax: BASE_SUSPENSION_MAX * 1.1,
      grip: BASE_GRIP * 1.25,
      fuelCapacity: BASE_FUEL_CAPACITY * 1.2,
    },
    stats: {
      speed: 3,
      acceleration: 7,
      handling: 4,
      grip: 8,
      stability: 7,
    },
  },
  {
    id: 'speedster',
    name: 'Desert Speedster',
    description: 'Lightning fast but prone to flipping. Handle with care.',
    unlockCost: 1500,
    color: '#ef4444', // Red
    baseSpec: {
      driveTorque: BASE_DRIVE_TORQUE * 0.9,
      maxWheelSpin: BASE_MAX_SPIN * 1.4,
      reverseSpin: BASE_REVERSE_SPIN,
      brakeTorque: BASE_BRAKE_TORQUE * 0.9,
      springK: BASE_SPRING_K * 0.9,
      springDamping: BASE_SPRING_DAMPING * 0.9,
      suspensionRest: BASE_SUSPENSION_REST * 0.9,
      suspensionMin: BASE_SUSPENSION_MIN,
      suspensionMax: BASE_SUSPENSION_MAX * 0.9,
      grip: BASE_GRIP * 0.9,
      fuelCapacity: BASE_FUEL_CAPACITY * 0.9,
    },
    stats: {
      speed: 9,
      acceleration: 6,
      handling: 7,
      grip: 4,
      stability: 3,
    },
  },
];
