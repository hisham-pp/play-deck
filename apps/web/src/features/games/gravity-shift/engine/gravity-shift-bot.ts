import type {
  CourseDefinition,
  CourseElement,
  GravityDirection,
  PhysicsCharacter,
} from '../types/gravity-shift.types';
import type { PlayerInput } from './gravity-physics';

export interface BotDecision {
  input: PlayerInput;
  shiftRequest?: GravityDirection;
}

export interface BotContext {
  character: PhysicsCharacter;
  currentGravity: GravityDirection;
  course: CourseDefinition;
  botDifficulty?: 'easy' | 'medium' | 'hard';
}

export function computeNextTarget(
  character: PhysicsCharacter,
  course: CourseDefinition,
): CourseElement {
  const checkpoints = course.elements
    .filter((e) => e.type === 'checkpoint')
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const targetCheckpoint = checkpoints.find((cp) => (cp.order ?? 0) > character.checkpointsPassed);

  if (targetCheckpoint) {
    return targetCheckpoint;
  }

  const finish = course.elements.find((e) => e.type === 'finish');
  if (finish) {
    return finish;
  }

  // Fallback to center
  return {
    id: 'center',
    type: 'finish',
    x: course.worldBounds.width / 2,
    y: course.worldBounds.height / 2,
    width: 40,
    height: 40,
  };
}

export function computeBotDecision(context: BotContext): BotDecision {
  const { character, currentGravity, course } = context;

  const target = computeNextTarget(character, course);
  const targetCenterX = target.x + target.width / 2;
  const targetCenterY = target.y + target.height / 2;

  const charCenterX = character.position.x + character.width / 2;
  const charCenterY = character.position.y + character.height / 2;

  const dx = targetCenterX - charCenterX;
  const dy = targetCenterY - charCenterY;

  const input: PlayerInput = {
    moveNegative: false,
    movePositive: false,
    jump: false,
  };

  const isVerticalGravity = currentGravity === 'down' || currentGravity === 'up';

  if (isVerticalGravity) {
    if (dx > 16) {
      input.movePositive = true;
    } else if (dx < -16) {
      input.moveNegative = true;
    }
  } else {
    // Horizontal gravity: tangent movement is along Y
    if (dy > 16) {
      input.movePositive = true;
    } else if (dy < -16) {
      input.moveNegative = true;
    }
  }

  // Jump logic: jump if grounded and facing a hazard or needing elevation
  if (character.isGrounded) {
    // Check if target is 'above' the floor
    if (currentGravity === 'down' && dy < -50) {
      input.jump = true;
    } else if (currentGravity === 'up' && dy > 50) {
      input.jump = true;
    } else if (currentGravity === 'right' && dx < -50) {
      input.jump = true;
    } else if (currentGravity === 'left' && dx > 50) {
      input.jump = true;
    }

    // Proximity to hazards ahead
    const scanDist = 90;
    const nearbyHazard = course.elements.find((el) => {
      if (el.type !== 'hazard') return false;
      const elDistX = Math.abs(el.x + el.width / 2 - charCenterX);
      const elDistY = Math.abs(el.y + el.height / 2 - charCenterY);
      return elDistX < scanDist && elDistY < scanDist;
    });

    if (nearbyHazard) {
      input.jump = true;
    }
  }

  // Tactical Gravity Shift logic
  let shiftRequest: GravityDirection | undefined;
  if (character.shiftCharges > 0 && character.shiftCooldown <= 0) {
    // If target requires major orthogonal movement and bot has stalled
    if (currentGravity === 'down' && dy < -250 && Math.abs(dx) < 100) {
      shiftRequest = 'up';
    } else if (currentGravity === 'up' && dy > 250 && Math.abs(dx) < 100) {
      shiftRequest = 'down';
    } else if (isVerticalGravity && Math.abs(dx) > 400 && Math.abs(dy) > 300) {
      shiftRequest = dx > 0 ? 'left' : 'right';
    }
  }

  return {
    input,
    shiftRequest,
  };
}
