import type {
  BrainCharacterState,
  CourseDefinition,
  CourseElement,
  RectAABB,
  Vector2D,
} from '../types/shared-brain.types';

export const GRAVITY = 980;
export const MOVE_ACCEL = 1400;
export const MAX_MOVE_SPEED = 240;
export const FRICTION = 1200;
export const JUMP_VELOCITY = -450;
export const BOUNCE_VELOCITY = -680;
export const COYOTE_TIME = 0.12;
export const JUMP_BUFFER = 0.12;
export const CHARACTER_WIDTH = 34;
export const CHARACTER_HEIGHT = 42;

export function createInitialCharacter(spawn: Vector2D): BrainCharacterState {
  return {
    position: { ...spawn },
    velocity: { x: 0, y: 0 },
    width: CHARACTER_WIDTH,
    height: CHARACTER_HEIGHT,
    isGrounded: false,
    facing: 'right',
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    tokensCollected: 0,
    keysHeld: 0,
    hasReachedGoal: false,
    isDead: false,
    respawnPoint: { ...spawn },
    activeNavigatorAction: false,
    activeMotorAction: false,
  };
}

export function checkAABB(a: RectAABB, b: RectAABB): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export interface PhysicsInput {
  moveLeft: boolean;
  moveRight: boolean;
  jumpPressed: boolean;
  interactPressed: boolean;
}

export interface PhysicsTickEvent {
  type: 'none' | 'jump' | 'bounce' | 'token' | 'checkpoint' | 'lever' | 'hazard_death' | 'goal';
  elementId?: string;
}

export function stepPlatformerPhysics(
  char: BrainCharacterState,
  elements: CourseElement[],
  input: PhysicsInput,
  dt: number,
  worldWidth = 2400,
  worldHeight = 800,
): { char: BrainCharacterState; event: PhysicsTickEvent; modifiedElements: CourseElement[] } {
  const state = { ...char };
  let event: PhysicsTickEvent = { type: 'none' };
  const modifiedElements = [...elements];

  // If character reached goal, freeze movement
  if (state.hasReachedGoal) {
    return { char: state, event, modifiedElements };
  }

  // Handle Death / Respawn reset
  if (state.isDead) {
    state.position = { ...state.respawnPoint };
    state.velocity = { x: 0, y: 0 };
    state.isDead = false;
    state.isGrounded = false;
    return { char: state, event, modifiedElements };
  }

  // 1. Horizontal Input & Acceleration
  state.activeNavigatorAction = input.moveLeft || input.moveRight;
  if (input.moveLeft && !input.moveRight) {
    state.velocity.x = Math.max(-MAX_MOVE_SPEED, state.velocity.x - MOVE_ACCEL * dt);
    state.facing = 'left';
  } else if (input.moveRight && !input.moveLeft) {
    state.velocity.x = Math.min(MAX_MOVE_SPEED, state.velocity.x + MOVE_ACCEL * dt);
    state.facing = 'right';
  } else {
    // Deceleration towards zero
    if (state.velocity.x > 0) {
      state.velocity.x = Math.max(0, state.velocity.x - FRICTION * dt);
    } else if (state.velocity.x < 0) {
      state.velocity.x = Math.min(0, state.velocity.x + FRICTION * dt);
    }
  }

  // 2. Jump Buffering & Coyote Time
  if (state.isGrounded) {
    state.coyoteTimer = COYOTE_TIME;
  } else {
    state.coyoteTimer = Math.max(0, state.coyoteTimer - dt);
  }

  if (input.jumpPressed) {
    state.jumpBufferTimer = JUMP_BUFFER;
    state.activeMotorAction = true;
  } else {
    state.jumpBufferTimer = Math.max(0, state.jumpBufferTimer - dt);
  }

  // Execute Jump if buffered and within coyote window
  if (state.jumpBufferTimer > 0 && state.coyoteTimer > 0) {
    state.velocity.y = JUMP_VELOCITY;
    state.isGrounded = false;
    state.coyoteTimer = 0;
    state.jumpBufferTimer = 0;
    event = { type: 'jump' };
  }

  // 3. Gravity Acceleration
  state.velocity.y += GRAVITY * dt;

  // 4. Horizontal Movement & Solid Collision
  state.position.x += state.velocity.x * dt;

  // World bounds horizontal
  if (state.position.x < 0) {
    state.position.x = 0;
    state.velocity.x = 0;
  } else if (state.position.x + state.width > worldWidth) {
    state.position.x = worldWidth - state.width;
    state.velocity.x = 0;
  }

  // Horizontal solid collision
  const charBoxH: RectAABB = {
    x: state.position.x,
    y: state.position.y,
    width: state.width,
    height: state.height,
  };

  for (const elem of elements) {
    if (elem.type === 'platform' || (elem.type === 'door' && elem.active !== false)) {
      if (checkAABB(charBoxH, elem)) {
        if (state.velocity.x > 0) {
          state.position.x = elem.x - state.width;
          state.velocity.x = 0;
        } else if (state.velocity.x < 0) {
          state.position.x = elem.x + elem.width;
          state.velocity.x = 0;
        }
      }
    }
  }

  // 5. Vertical Movement & Solid Collision
  state.position.y += state.velocity.y * dt;
  state.isGrounded = false;

  const charBoxV: RectAABB = {
    x: state.position.x,
    y: state.position.y,
    width: state.width,
    height: state.height,
  };

  for (const elem of elements) {
    if (elem.type === 'platform' || (elem.type === 'door' && elem.active !== false)) {
      if (checkAABB(charBoxV, elem)) {
        if (state.velocity.y > 0) {
          // Landing on platform
          state.position.y = elem.y - state.height;
          state.velocity.y = 0;
          state.isGrounded = true;
        } else if (state.velocity.y < 0) {
          // Hitting ceiling
          state.position.y = elem.y + elem.height;
          state.velocity.y = 0;
        }
      }
    }
  }

  // World bottom pit check (fall off world = death)
  if (state.position.y > worldHeight + 50) {
    state.isDead = true;
    event = { type: 'hazard_death' };
    return { char: state, event, modifiedElements };
  }

  // 6. Interactive Element Triggers
  const currentCharBox: RectAABB = {
    x: state.position.x,
    y: state.position.y,
    width: state.width,
    height: state.height,
  };

  for (let i = 0; i < modifiedElements.length; i++) {
    const elem = modifiedElements[i];

    if (!checkAABB(currentCharBox, elem)) continue;

    if (elem.type === 'bouncy-pad') {
      state.velocity.y = BOUNCE_VELOCITY;
      state.isGrounded = false;
      event = { type: 'bounce', elementId: elem.id };
    } else if (elem.type === 'laser-gate' && elem.active !== false) {
      state.isDead = true;
      event = { type: 'hazard_death', elementId: elem.id };
      return { char: state, event, modifiedElements };
    } else if (elem.type === 'token' && elem.active !== false) {
      modifiedElements[i] = { ...elem, active: false };
      state.tokensCollected += elem.value || 1;
      event = { type: 'token', elementId: elem.id };
    } else if (elem.type === 'checkpoint' && elem.active !== false) {
      state.respawnPoint = { x: elem.x, y: elem.y - state.height };
      modifiedElements[i] = { ...elem, active: false };
      event = { type: 'checkpoint', elementId: elem.id };
    } else if (elem.type === 'switch-lever') {
      if (input.interactPressed) {
        state.activeMotorAction = true;
        const newActive = !elem.active;
        modifiedElements[i] = { ...elem, active: newActive };
        event = { type: 'lever', elementId: elem.id };

        // Toggle linked door if configured
        if (elem.linkedDoorId) {
          const doorIdx = modifiedElements.findIndex((d) => d.id === elem.linkedDoorId);
          if (doorIdx !== -1) {
            modifiedElements[doorIdx] = {
              ...modifiedElements[doorIdx],
              active: !newActive, // if switch is on, door is open (active=false)
            };
          }
        }
      }
    } else if (elem.type === 'goal') {
      state.hasReachedGoal = true;
      event = { type: 'goal', elementId: elem.id };
    }
  }

  return { char: state, event, modifiedElements };
}

export interface UpdatePhysicsResult {
  character: BrainCharacterState;
  jumpTriggered: boolean;
  bounced: boolean;
  switchToggled: string | null;
  tokensCollected: string[];
  fellInHazard: boolean;
  reachedGoal: boolean;
}

export function updatePhysics(
  character: BrainCharacterState,
  course: CourseDefinition,
  input: { moveLeft: boolean; moveRight: boolean; jump: boolean; interact: boolean },
  dt: number,
  _activeSwitchIds?: Set<string>,
  _doorStates?: Map<string, number>,
): UpdatePhysicsResult {
  const { char: nextChar, event } = stepPlatformerPhysics(
    character,
    course.elements,
    {
      moveLeft: input.moveLeft,
      moveRight: input.moveRight,
      jumpPressed: input.jump,
      interactPressed: input.interact,
    },
    dt,
    course.worldBounds?.width || 2400,
    course.worldBounds?.height || 800,
  );

  return {
    character: nextChar,
    jumpTriggered: input.jump && character.isGrounded,
    bounced: event.type === 'bounce',
    switchToggled: event.type === 'lever' ? event.elementId || null : null,
    tokensCollected: event.type === 'token' && event.elementId ? [event.elementId] : [],
    fellInHazard: event.type === 'hazard_death',
    reachedGoal: event.type === 'goal',
  };
}
