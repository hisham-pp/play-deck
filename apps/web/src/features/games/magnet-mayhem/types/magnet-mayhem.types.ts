export type MagnetAction = 'idle' | 'attract' | 'repel';

export type TargetTier = 'normal' | 'gold' | 'star';

export type RoundPhase = 'countdown' | 'playing' | 'game-over';

export interface Vector2D {
  x: number;
  y: number;
}

export interface MagnetPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isBot: boolean;
  isHost: boolean;
  ready: boolean;
  score: number;
  position: Vector2D;
  velocity: Vector2D;
  aimAngle: number;
  action: MagnetAction;
  energy: number; // 0 to 100
  stunnedTimer: number; // seconds remaining when zapped
  targetHitCount: number;
  slingshotCount: number;
  repelHitCount: number;
  isTethered: boolean;
  tetherTarget: { x: number; y: number; id: string } | null;
}

export interface MetallicAnchor {
  id: string;
  x: number;
  y: number;
  radius: number;
  isMovable: boolean;
  velocity?: Vector2D;
  pulsePhase: number;
}

export interface TargetOrb {
  id: string;
  x: number;
  y: number;
  radius: number;
  tier: TargetTier;
  value: number;
  velocity: Vector2D;
  isCollected: boolean;
  respawnTimer: number;
  pulseTimer: number;
}

export interface HazardCoil {
  id: string;
  x: number;
  y: number;
  radius: number;
  zapCooldown: number;
  glowPhase: number;
}

export interface BoostZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  boostDir: Vector2D;
  magnitude: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'spark' | 'ring' | 'smoke' | 'trail';
}

export interface RepelShockwave {
  id: string;
  x: number;
  y: number;
  currentRadius: number;
  maxRadius: number;
  color: string;
  life: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface MagnetArenaConfig {
  width: number;
  height: number;
  roundDurationSec: number;
  targetQuota: number;
  botCount: number;
}

export interface MagnetArenaState {
  width: number;
  height: number;
  players: MagnetPlayer[];
  anchors: MetallicAnchor[];
  targets: TargetOrb[];
  hazards: HazardCoil[];
  boostZones: BoostZone[];
  particles: Particle[];
  shockwaves: RepelShockwave[];
  floatingTexts: FloatingText[];
  elapsedSec: number;
  roundDurationSec: number;
  isGameOver: boolean;
  winnerId: string | null;
  roundPhase: RoundPhase;
  countdownSec: number;
}

export interface MagnetMatchStats {
  gamesPlayed: number;
  wins: number;
  highScore: number;
  targetsCollected: number;
  slingshots: number;
  repelHits: number;
  lastPlayedAt: string;
}
