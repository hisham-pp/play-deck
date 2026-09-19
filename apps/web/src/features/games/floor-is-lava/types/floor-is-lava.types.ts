export type TileState = 'safe' | 'warning' | 'cracking' | 'lava' | 'temporary';

export type PowerUpType = 'platform' | 'super-push' | 'freeze' | 'double-jump';

export interface Vector2D {
  x: number;
  y: number;
}

export interface TileData {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  size: number;
  state: TileState;
  stability: number; // 1.0 (pristine) -> 0.0 (collapses into lava)
  warningTimer: number; // Seconds warning has been active
  dwellSec: number; // Time players spent standing on it
  temporaryLifetime?: number; // For platform power-up
}

export interface PowerUpInstance {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  row: number;
  col: number;
  spawnTime: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  durationSec: number;
}

export interface LavaPlayer {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isBot: boolean;
  isHost: boolean;
  ready: boolean;
  isAlive: boolean;
  eliminationRank?: number;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  pushCooldown: number;
  isPushing: boolean;
  activePowerUp: ActivePowerUp | null;
  hasDoubleJumpReady: boolean;
}

export interface LavaArenaConfig {
  rows: number;
  cols: number;
  tileSize: number;
  tileGap: number;
  lavaSpeedMultiplier: number;
}

export interface ArenaState {
  tiles: TileData[][];
  players: LavaPlayer[];
  powerUps: PowerUpInstance[];
  elapsedSec: number;
  frozenSec: number; // Time arena cracking is paused via freeze power-up
  isGameOver: boolean;
  winnerId: string | null;
}
