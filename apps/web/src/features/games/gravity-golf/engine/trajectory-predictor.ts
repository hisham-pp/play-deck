import type {
  AsteroidHazard,
  BallFlightStatus,
  BallState,
  CosmicCup,
  GravityObject,
  Vector2D,
  WallSegment,
} from '../types/gravity-golf.types';
import { BALL_RADIUS, stepPhysicsTick } from './gravity-physics';

export interface TrajectoryResult {
  points: Vector2D[];
  endStatus: BallFlightStatus;
  reachesCup: boolean;
  hitsHazard: boolean;
  totalBounces: number;
}

/**
 * Deterministically simulates forward physics steps to preview ball trajectory.
 */
export function predictTrajectory(
  startPos: Vector2D,
  initialVel: Vector2D,
  objects: GravityObject[],
  hazards: AsteroidHazard[],
  walls: WallSegment[],
  cup: CosmicCup,
  maxSteps = 160,
  stepSubdivision = 2,
): TrajectoryResult {
  let simBall: BallState = {
    position: { ...startPos },
    velocity: { ...initialVel },
    radius: BALL_RADIUS,
    status: 'in_flight',
    trail: [],
    flightTicks: 0,
  };

  const points: Vector2D[] = [{ ...startPos }];
  let reachesCup = false;
  let hitsHazard = false;
  let totalBounces = 0;

  for (let i = 0; i < maxSteps; i++) {
    const { ball: nextBall, bounced } = stepPhysicsTick(
      simBall,
      objects,
      hazards,
      walls,
      cup,
      (1 / 60) * stepSubdivision,
    );

    if (bounced) {
      totalBounces++;
    }

    simBall = nextBall;

    // Record sample points every 2 ticks
    if (i % 2 === 0) {
      points.push({ ...simBall.position });
    }

    if (simBall.status === 'sunk') {
      reachesCup = true;
      points.push({ ...cup.position });
      break;
    }

    if (simBall.status === 'absorbed') {
      hitsHazard = true;
      break;
    }

    if (simBall.status === 'out_of_bounds') {
      break;
    }
  }

  return {
    points,
    endStatus: simBall.status,
    reachesCup,
    hitsHazard,
    totalBounces,
  };
}
