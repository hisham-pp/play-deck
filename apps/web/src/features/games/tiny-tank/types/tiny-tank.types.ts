export interface Vector2D {
  x: number;
  y: number;
}

export const WEAPON_CANNON = 'cannon' as const;
export const WEAPON_BOUNCING = 'bouncing' as const;
export const WEAPON_HOMING = 'homing' as const;
export const WEAPON_MINE = 'mine' as const;
export const WEAPON_LASER = 'laser' as const;
export const WEAPON_RUBBER = 'rubber' as const;

export type WeaponType =
  | typeof WEAPON_CANNON
  | typeof WEAPON_BOUNCING
  | typeof WEAPON_HOMING
  | typeof WEAPON_MINE
  | typeof WEAPON_LASER
  | typeof WEAPON_RUBBER;

export const BLOCK_STEEL = 'steel' as const;
export const BLOCK_BRICK = 'brick' as const;
export const BLOCK_BARREL = 'barrel' as const;

export type BlockType = typeof BLOCK_STEEL | typeof BLOCK_BRICK | typeof BLOCK_BARREL;

export const PICKUP_AMMO = 'ammo' as const;
export const PICKUP_HEALTH = 'health' as const;
export const PICKUP_SHIELD = 'shield' as const;

export type PickupType =
  | typeof PICKUP_AMMO
  | typeof PICKUP_HEALTH
  | typeof PICKUP_SHIELD
  | typeof WEAPON_BOUNCING
  | typeof WEAPON_HOMING
  | typeof WEAPON_MINE
  | typeof WEAPON_LASER
  | typeof WEAPON_RUBBER;

export const DEFAULT_PLAYER_ID = 'player-1' as const;

export const TANK_COLOR_SLATE_800 = '#1e293b' as const;
export const TANK_COLOR_SKY_400 = '#38bdf8' as const;

export interface TankPlayer {
  id: string;
  name: string;
  color: string;
  isBot: boolean;
  isAlive: boolean;
  position: Vector2D;
  velocity: Vector2D;
  angle: number; // Hull facing radians
  turretAngle: number; // Turret aim radians
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  ammo: number;
  maxAmmo: number;
  reloadTimer: number;
  activeWeapon: WeaponType;
  weaponAmmo: Record<WeaponType, number>;
  score: number;
  kills: number;
  damageDealt: number;
  recoilOffset: number;
  invulnerableTimer: number;
}

export interface ArenaBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: BlockType;
  health: number;
  maxHealth: number;
}

export interface Projectile {
  id: string;
  shooterId: string;
  weapon: WeaponType;
  position: Vector2D;
  velocity: Vector2D;
  angle: number;
  radius: number;
  damage: number;
  bouncesRemaining: number;
  lifetime: number;
  targetPlayerId?: string;
}

export interface ProximityMine {
  id: string;
  ownerId: string;
  position: Vector2D;
  armTimer: number;
  isArmed: boolean;
  triggerRadius: number;
  blastRadius: number;
  damage: number;
  lifetime: number;
}

export interface PickupCrate {
  id: string;
  type: PickupType;
  position: Vector2D;
  radius: number;
  pulseTimer: number;
}

export interface ExplosionEffect {
  id: string;
  position: Vector2D;
  maxRadius: number;
  currentRadius: number;
  duration: number;
  age: number;
  color: string;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface TreadMark {
  x: number;
  y: number;
  angle: number;
  alpha: number;
}

export interface TinyTankMatchStats {
  playerId: string;
  playerName: string;
  kills: number;
  damageDealt: number;
  shotsFired: number;
  shotsHit: number;
  cratesCollected: number;
  score: number;
}

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface TinyTankConfig {
  botCount: number;
  botDifficulty: BotDifficulty;
  roundDuration: number;
  soundEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export type GameArenaStatus = 'lobby' | 'countdown' | 'playing' | 'round_over' | 'match_over';

export interface TinyTankArenaState {
  status: GameArenaStatus;
  timeRemaining: number;
  countdown: number;
  arenaWidth: number;
  arenaHeight: number;
  players: TankPlayer[];
  blocks: ArenaBlock[];
  projectiles: Projectile[];
  mines: ProximityMine[];
  crates: PickupCrate[];
  explosions: ExplosionEffect[];
  particles: ParticleEffect[];
  treadMarks: TreadMark[];
  winnerId?: string;
  winnerName?: string;
  stats: Record<string, TinyTankMatchStats>;
}

export interface TankInput {
  moveForward: boolean;
  moveBackward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  turretAngle: number;
  fire: boolean;
  switchWeapon?: WeaponType;
}
