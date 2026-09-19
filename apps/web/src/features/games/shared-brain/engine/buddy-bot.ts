import type {
  BrainCharacterState,
  CourseDefinition,
  CourseElement,
} from '../types/shared-brain.types';
import type { PhysicsInput } from './platformer-physics';

export function updateBuddyBot(
  botRole: 'navigator' | 'motor',
  char: BrainCharacterState,
  elements: CourseElement[],
  humanInput: Partial<PhysicsInput>,
  _timeSec: number,
): PhysicsInput {
  const input: PhysicsInput = {
    moveLeft: false,
    moveRight: false,
    jumpPressed: false,
    interactPressed: false,
  };

  if (botRole === 'motor') {
    // Human is controlling movement (moveLeft / moveRight)
    input.moveLeft = humanInput.moveLeft ?? false;
    input.moveRight = humanInput.moveRight ?? false;

    // Bot looks for jump triggers:
    // 1. Is there an upcoming pit ahead in moving direction?
    const checkAheadX = char.position.x + (char.facing === 'right' ? char.width + 30 : -30);
    const footY = char.position.y + char.height + 10;

    const hasGroundAhead = elements.some((e) => {
      if (e.type !== 'platform' && e.type !== 'bouncy-pad') return false;
      return (
        checkAheadX >= e.x &&
        checkAheadX <= e.x + e.width &&
        footY >= e.y &&
        footY <= e.y + e.height + 20
      );
    });

    if (char.isGrounded && !hasGroundAhead && (input.moveLeft || input.moveRight)) {
      input.jumpPressed = true;
    }

    // 2. Is character overlapping an inactive switch lever?
    const overlappingLever = elements.some(
      (e) =>
        e.type === 'switch-lever' &&
        !e.active &&
        char.position.x + char.width >= e.x &&
        char.position.x <= e.x + e.width &&
        char.position.y + char.height >= e.y &&
        char.position.y <= e.y + e.height,
    );

    if (overlappingLever) {
      input.interactPressed = true;
    }
  } else {
    // Bot is Navigator (controlling movement)
    input.jumpPressed = humanInput.jumpPressed ?? false;
    input.interactPressed = humanInput.interactPressed ?? false;

    // Move toward the right (goal is always forward)
    input.moveRight = true;

    // If at edge of ground and not jumping, briefly hesitate
    const checkAheadX = char.position.x + char.width + 25;
    const footY = char.position.y + char.height + 10;
    const hasGroundAhead = elements.some((e) => {
      if (e.type !== 'platform' && e.type !== 'bouncy-pad') return false;
      return (
        checkAheadX >= e.x &&
        checkAheadX <= e.x + e.width &&
        footY >= e.y &&
        footY <= e.y + e.height + 20
      );
    });

    if (char.isGrounded && !hasGroundAhead) {
      // Slow down or wait for human jump
      input.moveRight = false;
    }
  }

  return input;
}

export class BuddyBotEngine {
  private course: CourseDefinition;

  constructor(course: CourseDefinition) {
    this.course = course;
  }

  public update(
    char: BrainCharacterState,
    _doorStates?: Map<string, number>,
    _activeSwitchIds?: Set<string>,
    _collectedTokenIds?: Set<string>,
  ): { moveLeft: boolean; moveRight: boolean; jump: boolean; interact: boolean } {
    const input = updateBuddyBot('motor', char, this.course.elements, {}, 0);
    return {
      moveLeft: input.moveLeft,
      moveRight: input.moveRight,
      jump: input.jumpPressed,
      interact: input.interactPressed,
    };
  }
}
