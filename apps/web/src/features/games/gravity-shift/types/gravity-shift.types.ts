export type GravityDirection = 'down' | 'right' | 'up' | 'left';

export interface Vector2D {
  x: number;
  y: number;
}

export interface RectAABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CourseElementType =
  'platform' | 'hazard' | 'checkpoint' | 'finish' | 'bounce-pad' | 'energy-core';

export interface CourseElement extends RectAABB {
  id: string;
  type: CourseElementType;
  active?: boolean;
  color?: string;
  order?: number;
}

export interface CourseDefinition {
  id: string;
  name: string;
  description: string;
  worldBounds: { width: number; height: number };
  spawnPoint: Vector2D;
  initialGravity: GravityDirection;
  elements: CourseElement[];
}

export interface PhysicsCharacter {
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  isGrounded: boolean;
  groundNormal: Vector2D;
  shiftCharges: number;
  shiftCooldown: number;
  checkpointsPassed: number;
  reachedFinish: boolean;
  finishTimeMs: number | null;
  isDead: boolean;
  respawnPoint: Vector2D;
  coyoteTime: number;
  jumpBufferTime: number;
}

export interface GravityShiftPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isBot: boolean;
  isHost: boolean;
  ready: boolean;
  character: PhysicsCharacter;
  rank?: number;
}
