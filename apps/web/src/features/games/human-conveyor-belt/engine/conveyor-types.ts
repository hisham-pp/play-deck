export type ConveyorGlyph = '●' | '◆' | '★' | '▲' | '■' | '✦';

export type ObjectType = 'standard' | 'bouncy' | 'fragile' | 'heavy' | 'explosive';
export type ObjectShape = 'circle' | 'box';
export type ObjectStatus = 'spawning' | 'active' | 'delivered' | 'broken' | 'dropped';

export interface ConveyorSegment {
  id: string;
  seatIndex: number;
  label: string;
  x: number;
  y: number;
  baseY: number;
  length: number;
  thickness: number;
  angle: number; // in radians, [-PI/4, PI/4]
  targetAngle: number;
  elevation: number; // vertical offset [-60, 60]
  targetElevation: number;
  speed: number; // conveyor belt drive velocity [-150, 150]
  targetSpeed: number;
  color: string;
  glyph: ConveyorGlyph;
  assignedPlayerId: string | null;
  assignedPlayerName: string | null;
  isBot: boolean;
}

export interface MachineObject {
  id: string;
  type: ObjectType;
  shape: ObjectShape;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number; // For circle; or half-width for box
  width: number;
  height: number;
  rotation: number;
  vRot: number;
  mass: number;
  restitution: number;
  friction: number;
  durability: number; // Max normal impact velocity before shatter
  timer: number; // Countdown for explosive objects
  maxTimer: number;
  status: ObjectStatus;
  scoreValue: number;
  spawnTime: number;
}

export type ObstacleType = 'gear' | 'wind_tunnel' | 'piston' | 'chute_guide';

export interface MachineObstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  radius?: number; // For gears
  width?: number; // For wind tunnels, pistons
  height?: number;
  angle?: number;
  rotationSpeed?: number; // For gears
  windForceX?: number; // For wind tunnels
  windForceY?: number;
  phaseOffset?: number; // For oscillating pistons
}

export interface MachineSpawnPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  interval: number; // seconds between spawns
}

export interface DeliveryTargetZone {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface MachineConfig {
  id: string;
  name: string;
  theme: 'foundry' | 'gearworks' | 'cyberpunk' | 'rube_goldberg';
  description: string;
  minPlayers: number;
  maxPlayers: number;
  spawnPoint: MachineSpawnPoint;
  targetZone: DeliveryTargetZone;
  hazardY: number;
  timeLimit: number; // seconds
  targetDeliveries: number;
  objectPool: ObjectType[];
  defaultPlatforms: Array<{
    x: number;
    y: number;
    length: number;
    angle?: number;
  }>;
  obstacles: MachineObstacle[];
}

export type ConveyorPhase = 'ready' | 'running' | 'paused' | 'wave_cleared' | 'failed';

export interface ConveyorEvent {
  id: string;
  type: 'delivered' | 'broken' | 'dropped' | 'wave_cleared';
  text: string;
  points: number;
  timestamp: number;
}

export interface ConveyorGameState {
  phase: ConveyorPhase;
  layout: MachineConfig;
  segments: ConveyorSegment[];
  objects: MachineObject[];
  score: number;
  comboStreak: number;
  deliveredCount: number;
  brokenCount: number;
  droppedCount: number;
  timeRemaining: number;
  spawnCooldown: number;
  events: ConveyorEvent[];
  lastEvent: ConveyorEvent | null;
}
