export interface Vector2D {
  x: number;
  y: number;
}

export type LootRarity = 'bronze_coin' | 'silver_coin' | 'gold_bar' | 'gem' | 'chest';

export type PowerUpType = 'speed' | 'magnet' | 'shield' | 'thief' | 'decoy_drop';

export type TrapType = 'spikes' | 'slime' | 'decoy';

export interface DashPlayer {
  id: string;
  name: string;
  color: string;
  isBot: boolean;
  isAlive: boolean;
  position: Vector2D;
  velocity: Vector2D;
  angle: number;
  radius: number;
  score: number;
  coinsCollected: number;
  gemsCollected: number;
  trapsTriggered: number;
  stealsCount: number;
  activePowerUp: PowerUpType | null;
  powerUpTimeRemaining: number;
  stunTimer: number;
  slowTimer: number;
  invulnerableTimer: number;
}

export interface LootItem {
  id: string;
  type: LootRarity;
  position: Vector2D;
  radius: number;
  value: number;
  pulseTimer: number;
  powerUpReward?: PowerUpType;
}

export interface Trap {
  id: string;
  type: TrapType;
  position: Vector2D;
  width: number;
  height: number;
  isActive: boolean;
  cycleTimer: number;
  ownerId?: string;
}

export interface ObstacleBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wall' | 'bumper';
}

export interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  lifetime: number;
  maxLifetime: number;
}

export interface Particle {
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

export interface LootDashMatchStats {
  playerId: string;
  playerName: string;
  score: number;
  lootCollected: number;
  trapsTriggered: number;
  stealsCount: number;
  powerUpsUsed: number;
}

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface LootDashConfig {
  botCount: number;
  botDifficulty: BotDifficulty;
  roundDuration: number;
  targetScore: number;
  soundEnabled: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export type GameStatus = 'lobby' | 'countdown' | 'playing' | 'round_over' | 'match_over';

export interface LootDashArenaState {
  status: GameStatus;
  timeRemaining: number;
  countdown: number;
  targetScore: number;
  arenaWidth: number;
  arenaHeight: number;
  players: DashPlayer[];
  loot: LootItem[];
  traps: Trap[];
  obstacles: ObstacleBlock[];
  scores: FloatingScore[];
  particles: Particle[];
  winnerId?: string;
  winnerName?: string;
  stats: Record<string, LootDashMatchStats>;
}

export interface DashInput {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  activateTrap?: boolean;
}
