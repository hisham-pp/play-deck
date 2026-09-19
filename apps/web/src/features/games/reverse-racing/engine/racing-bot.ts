import type {
  Lane,
  Obstacle,
  ObstacleType,
  SaboteurState,
  VehicleState,
} from '../types/reverse-racing.types';
import { placeObstacle } from './obstacle-system';
import { jumpVehicle, steerVehicle } from './vehicle-physics';

export function updateBotDriver(
  botVehicle: VehicleState,
  trackObstacles: Obstacle[],
): VehicleState {
  if (botVehicle.status !== 'driving') return botVehicle;

  // Scan ahead 40m on bot's track
  const lookaheadDist = 45;
  const currentDist = botVehicle.distance;

  const upcomingObstacles = trackObstacles.filter(
    (obs) =>
      obs.active && obs.distance > currentDist && obs.distance <= currentDist + lookaheadDist,
  );

  if (upcomingObstacles.length === 0) return botVehicle;

  // Find the closest upcoming obstacle
  upcomingObstacles.sort((a, b) => a.distance - b.distance);
  const closest = upcomingObstacles[0];
  const distToObs = closest.distance - currentDist;

  // If obstacle is in bot's current lane
  if (closest.lane === botVehicle.lane) {
    // If it's close (< 18m) and can be jumped over
    if (distToObs <= 18 && (closest.type === 'roadblock' || closest.type === 'speed-bump')) {
      return jumpVehicle(botVehicle);
    }

    // Try dodging to an adjacent lane
    const availableLanes: Lane[] = [];
    if (botVehicle.lane > -1) availableLanes.push((botVehicle.lane - 1) as Lane);
    if (botVehicle.lane < 1) availableLanes.push((botVehicle.lane + 1) as Lane);

    // Pick lane with least upcoming obstacles
    const safestLane = availableLanes.find(
      (lane) =>
        !upcomingObstacles.some(
          (obs) => obs.lane === lane && Math.abs(obs.distance - closest.distance) < 15,
        ),
    );

    if (safestLane !== undefined) {
      const dir = safestLane < botVehicle.lane ? 'left' : 'right';
      return steerVehicle(botVehicle, dir);
    }
  }

  return botVehicle;
}

export function updateBotSaboteur(
  botSaboteur: SaboteurState,
  targetTrackId: string,
  targetVehicle: VehicleState,
  trackObstacles: Obstacle[],
  timeSec: number,
): { saboteur: SaboteurState; newObstacle: Obstacle | null } {
  // Only place periodically if enough energy (e.g. >= 30)
  if (botSaboteur.energy < 30) {
    return { saboteur: botSaboteur, newObstacle: null };
  }

  // Determine obstacle placement distance (35m to 55m ahead of target vehicle)
  const placeDistance = targetVehicle.distance + 35 + Math.sin(timeSec) * 10;
  const targetLane = targetVehicle.lane;

  const types: ObstacleType[] = ['roadblock', 'oil-slick', 'speed-bump', 'moving-wall'];
  const chosenType = types[Math.floor(Math.random() * types.length)];

  const result = placeObstacle(
    botSaboteur,
    targetTrackId,
    placeDistance,
    targetLane,
    chosenType,
    targetVehicle.distance,
    trackObstacles,
  );

  return { saboteur: result.saboteur, newObstacle: result.obstacle };
}
