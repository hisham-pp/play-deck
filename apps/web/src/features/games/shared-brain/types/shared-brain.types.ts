export type SharedBrainRole = 'navigator' | 'motor' | 'both';

export type GameMode = 'solo-buddy' | 'solo-twin' | 'coop' | 'race';

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
  | 'platform'
  | 'bouncy-pad'
  | 'laser-gate'
  | 'switch-lever'
  | 'door'
  | 'token'
  | 'checkpoint'
  | 'goal';

export interface CourseElement extends RectAABB {
  id: string;
  type: CourseElementType;
  active?: boolean;
  color?: string;
  linkedDoorId?: string; // for switches
  linkedSwitchId?: string; // for doors
  requiresKey?: boolean;
  value?: number; // for tokens
}

export interface CourseDefinition {
  id: string;
  name: string;
  number: number;
  description: string;
  parSeconds: number;
  spawnPoint: Vector2D;
  worldBounds: { width: number; height: number };
  elements: CourseElement[];
}

export interface BrainCharacterState {
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  coyoteTimer: number; // grace period after stepping off ledge
  jumpBufferTimer: number; // buffered jump inputs
  tokensCollected: number;
  keysHeld: number;
  hasReachedGoal: boolean;
  isDead: boolean;
  respawnPoint: Vector2D;
  activeNavigatorAction: boolean; // visual pulse when navigator moves
  activeMotorAction: boolean; // visual pulse when motor jumps/acts
}

export interface PlayerPair {
  pairId: string;
  navigatorId: string;
  motorId: string;
  navigatorName: string;
  motorName: string;
  navigatorAvatar: string;
  motorAvatar: string;
  colorA: string;
  colorB: string;
  isBotA?: boolean;
  isBotB?: boolean;
  character: BrainCharacterState;
  finishTimeMs?: number;
}

export interface SharedBrainPlayer {
  id: string;
  name: string;
  avatar: string;
  role: SharedBrainRole;
  teamIndex: number;
  isBot?: boolean;
  isHost?: boolean;
  ready?: boolean;
}

export interface CourseResult {
  courseId: string;
  timeMs: number;
  tokensCollected: number;
  totalTokens: number;
  deaths: number;
  syncScore: number; // 0-100 rating based on simultaneous coordination
}
