export type FighterAction =
  | 'idle'
  | 'walking'
  | 'slashing'
  | 'heavy_slashing'
  | 'parrying'
  | 'dashing'
  | 'staggered'
  | 'hit'
  | 'dead';

export const ACTION_IDLE: FighterAction = 'idle';
export const ACTION_WALKING: FighterAction = 'walking';
export const ACTION_SLASHING: FighterAction = 'slashing';
export const ACTION_HEAVY_SLASHING: FighterAction = 'heavy_slashing';
export const ACTION_PARRYING: FighterAction = 'parrying';
export const ACTION_DASHING: FighterAction = 'dashing';
export const ACTION_STAGGERED: FighterAction = 'staggered';
export const ACTION_HIT: FighterAction = 'hit';
export const ACTION_DEAD: FighterAction = 'dead';

export const COLOR_SPARK_BLUE = '#38bdf8';
export const COLOR_SPARK_GOLD = '#f59e0b';
export const COLOR_SPARK_RED = '#ef4444';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

export interface Fighter {
  id: 'p1' | 'p2';
  name: string;
  x: number;
  y: number;
  vy: number;
  facing: 1 | -1;
  health: number;
  maxHealth: number;
  posture: number;
  maxPosture: number;
  stamina: number;
  maxStamina: number;
  state: FighterAction;
  stateTimer: number;
  slashType: 'light' | 'heavy' | null;
  parryWindowActive: boolean;
  isGrounded: boolean;
  roundsWon: number;
  dashCooldown: number;
  attackCooldown: number;
  hitboxActive: boolean;
}

export interface SparkParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  opacity: number;
  life: number;
}

export type CombatSoundEvent =
  | 'slash'
  | 'heavy_slash'
  | 'parry'
  | 'block'
  | 'hit'
  | 'posture_break'
  | 'dash'
  | 'clash'
  | 'round_win'
  | 'match_win';

export interface SwordFightState {
  status: 'waiting' | 'countdown' | 'fighting' | 'round_over' | 'match_over';
  countdownTimer: number;
  round: number;
  maxRounds: number;
  p1: Fighter;
  p2: Fighter;
  sparks: SparkParticle[];
  floatingTexts: FloatingText[];
  soundEvents: CombatSoundEvent[];
  difficulty: Difficulty;
  isTwoPlayer: boolean;
  roundWinner: 'p1' | 'p2' | null;
  matchWinner: 'p1' | 'p2' | null;
  score: number;
  timeRemaining: number;
}
