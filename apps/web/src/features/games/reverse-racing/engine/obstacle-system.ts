import type { Lane, Obstacle, ObstacleType, SaboteurState } from '../types/reverse-racing.types';
import { TRACK_LENGTH } from './vehicle-physics';

export const MAX_ENERGY = 100;
export const ENERGY_RECHARGE_RATE = 14; // energy regenerated per second

export const OBSTACLE_CONFIG: Record<
  ObstacleType,
  {
    name: string;
    cost: number;
    description: string;
    color: string;
    icon: string;
  }
> = {
  roadblock: {
    name: 'Roadblock',
    cost: 25,
    description: 'Concrete barrier that halts vehicle unless leaped over.',
    color: 'border-rose-500 bg-rose-500/10 text-rose-400',
    icon: '🚧',
  },
  'oil-slick': {
    name: 'Oil Slick',
    cost: 20,
    description: 'Greasy patch that locks steering traction for 1.4 seconds.',
    color: 'border-purple-500 bg-purple-500/10 text-purple-400',
    icon: '🛢️',
  },
  'speed-bump': {
    name: 'Speed Bump',
    cost: 15,
    description: 'Rubber speed trap that reduces velocity to 45% if hit.',
    color: 'border-amber-500 bg-amber-500/10 text-amber-400',
    icon: '〰️',
  },
  'moving-wall': {
    name: 'Moving Wall',
    cost: 35,
    description: 'Sweeping barrier that continuously oscillates across lanes.',
    color: 'border-orange-500 bg-orange-500/10 text-orange-400',
    icon: '🧱',
  },
  'fake-road': {
    name: 'Pitfall Gap',
    cost: 30,
    description: 'Deep road fissure requiring a high jump or lane escape.',
    color: 'border-red-600 bg-red-600/10 text-red-400',
    icon: '🕳️',
  },
  'boost-pad': {
    name: 'Boost Pad',
    cost: 15,
    description: 'Rocket strip. High risk/reward—boosts car into oncoming hazards!',
    color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    icon: '⚡',
  },
};

export function createInitialSaboteur(saboteurId: string, targetPlayerId: string): SaboteurState {
  return {
    saboteurId,
    targetPlayerId,
    energy: 50, // Starts at 50 energy
    selectedObstacle: 'roadblock',
    crashesInflicted: 0,
    obstaclesPlaced: 0,
    sabotageScore: 0,
  };
}

export function rechargeEnergy(saboteur: SaboteurState, dt: number): SaboteurState {
  const newEnergy = Math.min(MAX_ENERGY, saboteur.energy + ENERGY_RECHARGE_RATE * dt);
  return {
    ...saboteur,
    energy: newEnergy,
  };
}

export interface PlacementValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates that the requested placement is fair and doesn't create an impossible track.
 */
export function validateObstaclePlacement(
  distance: number,
  lane: Lane,
  type: ObstacleType,
  targetVehicleDistance: number,
  existingTrackObstacles: Obstacle[],
): PlacementValidationResult {
  // 1. Spawn and finish protection zone
  if (distance < 40) {
    return { valid: false, reason: 'Cannot place obstacles in the start zone' };
  }
  if (distance > TRACK_LENGTH - 30) {
    return { valid: false, reason: 'Cannot place obstacles in the finish zone' };
  }

  // 2. Minimum distance ahead of current vehicle position (reaction window)
  if (distance <= targetVehicleDistance + 18) {
    return { valid: false, reason: 'Must place obstacles at least 18m ahead of racer' };
  }

  // 3. Proximity to existing obstacle in the same lane
  for (const obs of existingTrackObstacles) {
    if (obs.active && obs.lane === lane && Math.abs(obs.distance - distance) < 12) {
      return { valid: false, reason: 'Too close to an existing obstacle in this lane' };
    }
  }

  // 4. Prevent impossible tracks: Cannot block all 3 lanes at the exact same distance
  const nearbyObs = existingTrackObstacles.filter(
    (obs) => obs.active && Math.abs(obs.distance - distance) < 6,
  );
  const occupiedLanes = new Set(nearbyObs.map((o) => o.lane));
  occupiedLanes.add(lane);

  if (occupiedLanes.size >= 3 && type !== 'speed-bump') {
    // If all 3 lanes would be blocked, check if at least one is jumpable/clearable
    const allSolid = nearbyObs.every((o) => o.type === 'roadblock' || o.type === 'moving-wall');
    if (allSolid && (type === 'roadblock' || type === 'moving-wall')) {
      return {
        valid: false,
        reason: 'Cannot block all 3 lanes with solid barriers simultaneously',
      };
    }
  }

  return { valid: true };
}

export function placeObstacle(
  saboteur: SaboteurState,
  targetTrackId: string,
  distance: number,
  lane: Lane,
  type: ObstacleType,
  targetVehicleDistance: number,
  existingTrackObstacles: Obstacle[],
): { saboteur: SaboteurState; obstacle: Obstacle | null; error?: string } {
  const cost = OBSTACLE_CONFIG[type].cost;
  if (saboteur.energy < cost) {
    return { saboteur, obstacle: null, error: 'Not enough energy' };
  }

  const validation = validateObstaclePlacement(
    distance,
    lane,
    type,
    targetVehicleDistance,
    existingTrackObstacles,
  );
  if (!validation.valid) {
    return { saboteur, obstacle: null, error: validation.reason };
  }

  const obstacle: Obstacle = {
    id: `obs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    trackId: targetTrackId,
    distance,
    lane,
    placedBy: saboteur.saboteurId,
    active: true,
    movingWallPhase: type === 'moving-wall' ? Math.random() * Math.PI * 2 : undefined,
  };

  const updatedSaboteur: SaboteurState = {
    ...saboteur,
    energy: saboteur.energy - cost,
    obstaclesPlaced: saboteur.obstaclesPlaced + 1,
    sabotageScore: saboteur.sabotageScore + 50, // Points for placing
  };

  return { saboteur: updatedSaboteur, obstacle };
}
