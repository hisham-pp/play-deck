export interface Vector2D {
  x: number;
  y: number;
}

export type WeaponType = 'cannon' | 'bouncing' | 'homing' | 'mine' | 'laser' | 'rubber';

export type BlockType = 'steel' | 'brick' | 'barrel';

export type PickupType =
  'ammo' | 'health' | 'shield' | 'bouncing' | 'homing' | 'mine' | 'laser' | 'rubber';

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
