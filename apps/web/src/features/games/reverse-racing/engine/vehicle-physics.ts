import type { Lane, Obstacle, VehicleState } from '../types/reverse-racing.types';

export const TRACK_LENGTH = 1000; // 1000 meters track
export const BASE_SPEED = 32; // 32 m/s (~115 km/h)
export const MAX_SPEED = 48; // 48 m/s
export const MIN_SPEED = 14; // 14 m/s
export const ACCELERATION = 16; // m/s^2
export const BRAKE_DECELERATION = 26; // m/s^2
export const JUMP_VELOCITY = 10.5; // m/s initial jump lift
export const GRAVITY = 28; // m/s^2 downward gravity
export const LANE_TRANSITION_SPEED = 7.5; // lateral lane change speed

export type CollisionEventType =
  | 'none'
  | 'crash_roadblock'
  | 'hit_speedbump'
  | 'slip_oil'
  | 'crash_wall'
  | 'crash_pitfall'
  | 'turbo_boost'
  | 'jumped_over';

export interface VehicleTickResult {
  vehicle: VehicleState;
  collisionEvent: CollisionEventType;
  finished: boolean;
}

export function createInitialVehicle(
  playerId: string,
  playerName: string,
  avatar: string,
  color: string,
  isBot = false,
): VehicleState {
  return {
    playerId,
    playerName,
    avatar,
    color,
    distance: 0,
    lane: 0,
    targetLane: 0,
    lateralProgress: 0,
    speed: BASE_SPEED,
    jumpHeight: 0,
    jumpVelocity: 0,
    status: 'driving',
    slideTimer: 0,
    crashTimer: 0,
    crashesSuffered: 0,
    isBot,
  };
}

export function steerVehicle(vehicle: VehicleState, direction: 'left' | 'right'): VehicleState {
  if (vehicle.status === 'crashed' || vehicle.status === 'finished') {
    return vehicle;
  }
  // If sliding on oil, steering input is unresponsive
  if (vehicle.slideTimer > 0) {
    return vehicle;
  }

  let nextLane: Lane = vehicle.targetLane;
  if (direction === 'left' && vehicle.targetLane > -1) {
    nextLane = (vehicle.targetLane - 1) as Lane;
  } else if (direction === 'right' && vehicle.targetLane < 1) {
    nextLane = (vehicle.targetLane + 1) as Lane;
  }

  return {
    ...vehicle,
    targetLane: nextLane,
  };
}

export function jumpVehicle(vehicle: VehicleState): VehicleState {
  if (vehicle.status === 'crashed' || vehicle.status === 'finished') {
    return vehicle;
  }
  // Can only jump when grounded
  if (vehicle.jumpHeight <= 0.05) {
    return {
      ...vehicle,
      jumpVelocity: JUMP_VELOCITY,
      status: 'jumping',
    };
  }
  return vehicle;
}

export function brakeVehicle(vehicle: VehicleState, dt: number): VehicleState {
  if (vehicle.status === 'crashed' || vehicle.status === 'finished') {
    return vehicle;
  }
  const newSpeed = Math.max(MIN_SPEED, vehicle.speed - BRAKE_DECELERATION * dt);
  return {
    ...vehicle,
    speed: newSpeed,
  };
}

/**
 * Calculates current active lane for moving walls based on sinusoidal sweep.
 */
export function getMovingWallCurrentLane(obs: Obstacle, timeSec: number): Lane {
  const phase = (obs.movingWallPhase || 0) + timeSec * 1.8;
  const sinVal = Math.sin(phase);
  if (sinVal < -0.33) return -1;
  if (sinVal > 0.33) return 1;
  return 0;
}

/**
 * Step vehicle physics forward by dt.
 */
export function stepVehicleTick(
  vehicle: VehicleState,
  trackObstacles: Obstacle[],
  dt: number,
  timeSec = 0,
): VehicleTickResult {
  if (vehicle.status === 'finished') {
    return { vehicle, collisionEvent: 'none', finished: false };
  }

  const current = { ...vehicle };
  let collisionEvent: CollisionEventType = 'none';

  // 1. Handle recovery timers
  if (current.crashTimer > 0) {
    current.crashTimer = Math.max(0, current.crashTimer - dt);
    if (current.crashTimer === 0) {
      current.status = 'driving';
      current.speed = BASE_SPEED * 0.7; // Restart after crash at 70% speed
    }
  }

  if (current.slideTimer > 0) {
    current.slideTimer = Math.max(0, current.slideTimer - dt);
    if (current.slideTimer === 0 && current.status === 'sliding') {
      current.status = 'driving';
    }
  }

  // If crashed, vehicle doesn't advance
  if (current.status === 'crashed') {
    return { vehicle: current, collisionEvent: 'none', finished: false };
  }

  // 2. Lateral lane transition interpolation
  const diff = current.targetLane - current.lateralProgress;
  if (Math.abs(diff) > 0.01) {
    const step = Math.sign(diff) * Math.min(Math.abs(diff), LANE_TRANSITION_SPEED * dt);
    current.lateralProgress += step;
  } else {
    current.lateralProgress = current.targetLane;
    current.lane = current.targetLane;
  }

  // 3. Jump physics
  if (current.jumpHeight > 0 || current.jumpVelocity > 0) {
    current.jumpHeight += current.jumpVelocity * dt;
    current.jumpVelocity -= GRAVITY * dt;

    if (current.jumpHeight <= 0) {
      current.jumpHeight = 0;
      current.jumpVelocity = 0;
      if (current.status === 'jumping') {
        current.status = 'driving';
      }
    }
  }

  // 4. Forward speed acceleration towards BASE_SPEED
  if (current.speed < BASE_SPEED && current.status === 'driving') {
    current.speed = Math.min(BASE_SPEED, current.speed + ACCELERATION * dt);
  } else if (current.speed > BASE_SPEED) {
    // Gradual decay of turbo boost
    current.speed = Math.max(BASE_SPEED, current.speed - 6 * dt);
  }

  // 5. Advance track distance
  const prevDist = current.distance;
  current.distance += current.speed * dt;

  // 6. Check finish line
  if (current.distance >= TRACK_LENGTH) {
    current.distance = TRACK_LENGTH;
    current.status = 'finished';
    return { vehicle: current, collisionEvent: 'none', finished: true };
  }

  // 7. Check collisions with obstacles on this track
  const hitWindow = 3.5; // meters detection window
  for (const obs of trackObstacles) {
    if (!obs.active) continue;

    // Check if vehicle crossed the obstacle in this tick
    const distDiff = obs.distance - current.distance;
    const crossed = prevDist <= obs.distance && current.distance >= obs.distance;
    const isNearby = Math.abs(distDiff) <= hitWindow;

    if (crossed || isNearby) {
      // Determine obstacle effective lane
      let obsLane = obs.lane;
      if (obs.type === 'moving-wall') {
        obsLane = getMovingWallCurrentLane(obs, timeSec);
      }

      // Check lane alignment (vehicle rounded lateral progress)
      const currentRoundedLane = Math.round(current.lateralProgress) as Lane;
      if (currentRoundedLane === obsLane) {
        switch (obs.type) {
          case 'roadblock': {
            if (current.jumpHeight >= 1.0) {
              collisionEvent = 'jumped_over';
            } else {
              collisionEvent = 'crash_roadblock';
              current.status = 'crashed';
              current.speed = 0;
              current.crashTimer = 1.3;
              current.crashesSuffered += 1;
              obs.active = false; // Destroy obstacle on impact
            }
            break;
          }

          case 'speed-bump': {
            if (current.jumpHeight >= 0.5) {
              collisionEvent = 'jumped_over';
            } else {
              collisionEvent = 'hit_speedbump';
              current.speed = Math.max(MIN_SPEED, current.speed * 0.45);
            }
            break;
          }

          case 'oil-slick': {
            if (current.jumpHeight < 0.4) {
              collisionEvent = 'slip_oil';
              current.status = 'sliding';
              current.slideTimer = 1.4;
            }
            break;
          }

          case 'moving-wall': {
            collisionEvent = 'crash_wall';
            current.status = 'crashed';
            current.speed = 0;
            current.crashTimer = 1.4;
            current.crashesSuffered += 1;
            obs.active = false;
            break;
          }

          case 'fake-road': {
            if (current.jumpHeight >= 1.2) {
              collisionEvent = 'jumped_over';
            } else {
              collisionEvent = 'crash_pitfall';
              current.status = 'crashed';
              current.speed = 0;
              current.crashTimer = 1.5;
              current.crashesSuffered += 1;
            }
            break;
          }

          case 'boost-pad': {
            collisionEvent = 'turbo_boost';
            current.speed = MAX_SPEED * 1.25;
            obs.active = false;
            break;
          }
        }
      }
    }
  }

  return { vehicle: current, collisionEvent, finished: false };
}

export const stepVehiclePhysics = stepVehicleTick;
