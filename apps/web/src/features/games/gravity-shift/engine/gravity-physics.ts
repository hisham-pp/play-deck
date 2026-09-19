import type {
  CourseDefinition,
  GravityDirection,
  PhysicsCharacter,
  RectAABB,
  Vector2D,
} from '../types/gravity-shift.types';

export const GRAVITY_MAGNITUDE = 980;
export const MOVE_ACCEL = 1500;
export const MAX_SPEED = 280;
export const FRICTION = 1100;
export const JUMP_IMPULSE = 460;
export const BOUNCE_IMPULSE = 680;
export const SHIFT_COOLDOWN_SEC = 2.0;
export const MAX_SHIFT_CHARGES = 3;
export const CHAR_WIDTH = 32;
export const CHAR_HEIGHT = 32;

export function getGravityVector(dir: GravityDirection): Vector2D {
  switch (dir) {
    case 'down':
      return { x: 0, y: GRAVITY_MAGNITUDE };
    case 'up':
      return { x: 0, y: -GRAVITY_MAGNITUDE };
    case 'left':
      return { x: -GRAVITY_MAGNITUDE, y: 0 };
    case 'right':
      return { x: GRAVITY_MAGNITUDE, y: 0 };
  }
}

export function rotateGravityClockwise(current: GravityDirection): GravityDirection {
  switch (current) {
    case 'down':
      return 'left';
    case 'left':
      return 'up';
    case 'up':
      return 'right';
    case 'right':
      return 'down';
  }
}

export function rotateGravityCounterClockwise(current: GravityDirection): GravityDirection {
  switch (current) {
    case 'down':
      return 'right';
    case 'right':
      return 'up';
    case 'up':
      return 'left';
    case 'left':
      return 'down';
  }
}

export function createInitialCharacter(spawn: Vector2D): PhysicsCharacter {
  return {
    position: { ...spawn },
    velocity: { x: 0, y: 0 },
    width: CHAR_WIDTH,
    height: CHAR_HEIGHT,
    isGrounded: false,
    groundNormal: { x: 0, y: -1 },
    shiftCharges: MAX_SHIFT_CHARGES,
    shiftCooldown: 0,
    checkpointsPassed: 0,
    reachedFinish: false,
    finishTimeMs: null,
    isDead: false,
    respawnPoint: { ...spawn },
    coyoteTime: 0,
    jumpBufferTime: 0,
  };
}

export interface PlayerInput {
  moveNegative: boolean; // Left when down/up, Up when left/right
  movePositive: boolean; // Right when down/up, Down when left/right
  jump: boolean;
}

export interface PhysicsTickResult {
  character: PhysicsCharacter;
  jumpTriggered: boolean;
  bounced: boolean;
  checkpointReached: string | null;
  hazardHit: boolean;
  reachedFinish: boolean;
}

function checkAABB(a: RectAABB, b: RectAABB): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function updateGravityCharacterPhysics(
  char: PhysicsCharacter,
  course: CourseDefinition,
  gravityDir: GravityDirection,
  input: PlayerInput,
  dt: number,
): PhysicsTickResult {
  const next: PhysicsCharacter = {
    ...char,
    position: { ...char.position },
    velocity: { ...char.velocity },
  };

  let jumpTriggered = false;
  let bounced = false;
  let checkpointReached: string | null = null;
  let hazardHit = false;
  let reachedFinish = false;

  if (next.reachedFinish) {
    return {
      character: next,
      jumpTriggered,
      bounced,
      checkpointReached,
      hazardHit,
      reachedFinish: false,
    };
  }

  // Shift cooldown reduction
  if (next.shiftCooldown > 0) {
    next.shiftCooldown = Math.max(0, next.shiftCooldown - dt);
  }

  // Apply Gravity Acceleration
  const gVec = getGravityVector(gravityDir);
  next.velocity.x += gVec.x * dt;
  next.velocity.y += gVec.y * dt;

  // Surface tangent acceleration (Move inputs)
  const isVerticalGravity = gravityDir === 'down' || gravityDir === 'up';
  if (isVerticalGravity) {
    // Horizontal movement along X
    if (input.moveNegative && !input.movePositive) {
      next.velocity.x -= MOVE_ACCEL * dt;
    } else if (input.movePositive && !input.moveNegative) {
      next.velocity.x += MOVE_ACCEL * dt;
    } else {
      // Apply friction
      if (next.velocity.x > 0) {
        next.velocity.x = Math.max(0, next.velocity.x - FRICTION * dt);
      } else if (next.velocity.x < 0) {
        next.velocity.x = Math.min(0, next.velocity.x + FRICTION * dt);
      }
    }
    next.velocity.x = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, next.velocity.x));
  } else {
    // Horizontal gravity: movement along Y
    if (input.moveNegative && !input.movePositive) {
      next.velocity.y -= MOVE_ACCEL * dt;
    } else if (input.movePositive && !input.moveNegative) {
      next.velocity.y += MOVE_ACCEL * dt;
    } else {
      // Apply friction
      if (next.velocity.y > 0) {
        next.velocity.y = Math.max(0, next.velocity.y - FRICTION * dt);
      } else if (next.velocity.y < 0) {
        next.velocity.y = Math.min(0, next.velocity.y + FRICTION * dt);
      }
    }
    next.velocity.y = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, next.velocity.y));
  }

  // Jump buffer & coyote time
  if (next.isGrounded) {
    next.coyoteTime = 0.12;
  } else {
    next.coyoteTime = Math.max(0, next.coyoteTime - dt);
  }

  if (input.jump) {
    next.jumpBufferTime = 0.12;
  } else {
    next.jumpBufferTime = Math.max(0, next.jumpBufferTime - dt);
  }

  // Jump execution opposite to gravity vector
  if (next.jumpBufferTime > 0 && next.coyoteTime > 0) {
    jumpTriggered = true;
    next.jumpBufferTime = 0;
    next.coyoteTime = 0;
    next.isGrounded = false;

    switch (gravityDir) {
      case 'down':
        next.velocity.y = -JUMP_IMPULSE;
        break;
      case 'up':
        next.velocity.y = JUMP_IMPULSE;
        break;
      case 'left':
        next.velocity.x = JUMP_IMPULSE;
        break;
      case 'right':
        next.velocity.x = -JUMP_IMPULSE;
        break;
    }
  }

  // Move along X & resolve collisions
  next.position.x += next.velocity.x * dt;
  const charBox: RectAABB = {
    x: next.position.x,
    y: next.position.y,
    width: next.width,
    height: next.height,
  };

  const platforms = course.elements.filter((e) => e.type === 'platform');
  for (const plat of platforms) {
    if (checkAABB(charBox, plat)) {
      if (next.velocity.x > 0) {
        next.position.x = plat.x - next.width;
        next.velocity.x = 0;
        if (gravityDir === 'right') next.isGrounded = true;
      } else if (next.velocity.x < 0) {
        next.position.x = plat.x + plat.width;
        next.velocity.x = 0;
        if (gravityDir === 'left') next.isGrounded = true;
      }
      charBox.x = next.position.x;
    }
  }

  // Move along Y & resolve collisions
  next.position.y += next.velocity.y * dt;
  charBox.y = next.position.y;
  next.isGrounded = false;

  for (const plat of platforms) {
    if (checkAABB(charBox, plat)) {
      if (next.velocity.y > 0) {
        next.position.y = plat.y - next.height;
        next.velocity.y = 0;
        if (gravityDir === 'down') next.isGrounded = true;
      } else if (next.velocity.y < 0) {
        next.position.y = plat.y + plat.height;
        next.velocity.y = 0;
        if (gravityDir === 'up') next.isGrounded = true;
      }
      charBox.y = next.position.y;
    }
  }

  // Trigger elements: Hazards, Checkpoints, Bounce Pads, Finish
  for (const el of course.elements) {
    if (!checkAABB(charBox, el)) continue;

    switch (el.type) {
      case 'hazard':
        hazardHit = true;
        next.position = { ...next.respawnPoint };
        next.velocity = { x: 0, y: 0 };
        break;

      case 'checkpoint':
        checkpointReached = el.id;
        next.respawnPoint = { x: el.x + (el.width - next.width) / 2, y: el.y };
        next.shiftCharges = MAX_SHIFT_CHARGES;
        break;

      case 'bounce-pad':
        bounced = true;
        switch (gravityDir) {
          case 'down':
            next.velocity.y = -BOUNCE_IMPULSE;
            break;
          case 'up':
            next.velocity.y = BOUNCE_IMPULSE;
            break;
          case 'left':
            next.velocity.x = BOUNCE_IMPULSE;
            break;
          case 'right':
            next.velocity.x = -BOUNCE_IMPULSE;
            break;
        }
        break;

      case 'finish':
        reachedFinish = true;
        next.reachedFinish = true;
        break;
    }
  }

  // World bounds constraints
  const bounds = course.worldBounds;
  if (next.position.x < 0) {
    next.position.x = 0;
    next.velocity.x = 0;
  } else if (next.position.x + next.width > bounds.width) {
    next.position.x = bounds.width - next.width;
    next.velocity.x = 0;
  }

  if (next.position.y < 0) {
    next.position.y = 0;
    next.velocity.y = 0;
  } else if (next.position.y + next.height > bounds.height) {
    // Falling off map counts as hazard respawn
    hazardHit = true;
    next.position = { ...next.respawnPoint };
    next.velocity = { x: 0, y: 0 };
  }

  return {
    character: next,
    jumpTriggered,
    bounced,
    checkpointReached,
    hazardHit,
    reachedFinish,
  };
}
