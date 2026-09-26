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

export const ARENA_WIDTH = 800;
export const ARENA_FLOOR_Y = 380;
export const FIGHTER_WIDTH = 40;
export const ATTACK_RANGE = 90;
export const LIGHT_ATTACK_DAMAGE = 14;
export const HEAVY_ATTACK_DAMAGE = 28;
export const LIGHT_POSTURE_DAMAGE = 18;
export const HEAVY_POSTURE_DAMAGE = 38;
export const PARRY_DEFLECT_POSTURE_DAMAGE = 30;
export const PARRY_WINDOW_DURATION = 0.22;
export const STAGGER_DURATION = 2.0;

export function createInitialFighter(
  id: 'p1' | 'p2',
  name: string,
  x: number,
  facing: 1 | -1,
): Fighter {
  return {
    id,
    name,
    x,
    y: 0,
    vy: 0,
    facing,
    health: 100,
    maxHealth: 100,
    posture: 0,
    maxPosture: 100,
    stamina: 100,
    maxStamina: 100,
    state: 'idle',
    stateTimer: 0,
    slashType: null,
    parryWindowActive: false,
    isGrounded: true,
    roundsWon: 0,
    dashCooldown: 0,
    attackCooldown: 0,
    hitboxActive: false,
  };
}

export function createInitialSwordFightState(options?: {
  difficulty?: Difficulty;
  isTwoPlayer?: boolean;
}): SwordFightState {
  const difficulty = options?.difficulty ?? 'normal';
  const isTwoPlayer = options?.isTwoPlayer ?? false;

  return {
    status: 'countdown',
    countdownTimer: 2.0,
    round: 1,
    maxRounds: 3,
    p1: createInitialFighter('p1', 'Player 1', 260, 1),
    p2: createInitialFighter('p2', isTwoPlayer ? 'Player 2' : 'Ronin AI', 540, -1),
    sparks: [],
    floatingTexts: [],
    soundEvents: [],
    difficulty,
    isTwoPlayer,
    roundWinner: null,
    matchWinner: null,
    score: 0,
    timeRemaining: 60,
  };
}

export interface PlayerInput {
  moveLeft?: boolean;
  moveRight?: boolean;
  jump?: boolean;
  slash?: boolean;
  heavySlash?: boolean;
  parry?: boolean;
  dash?: boolean;
}

export function handleFighterInput(
  fighter: Fighter,
  input: PlayerInput,
  otherFighter: Fighter,
  state: SwordFightState,
): void {
  if (state.status !== 'fighting') return;
  if (fighter.state === 'staggered' || fighter.state === 'hit' || fighter.state === 'dead') return;

  // Attack inputs
  if (
    input.heavySlash &&
    fighter.attackCooldown <= 0 &&
    fighter.stamina >= 25 &&
    fighter.state !== 'slashing' &&
    fighter.state !== 'heavy_slashing' &&
    fighter.state !== 'parrying'
  ) {
    fighter.state = 'heavy_slashing';
    fighter.stateTimer = 0.55;
    fighter.slashType = 'heavy';
    fighter.stamina = Math.max(0, fighter.stamina - 25);
    fighter.hitboxActive = false;
    fighter.attackCooldown = 0.65;
    state.soundEvents.push('heavy_slash');
    return;
  }

  if (
    input.slash &&
    fighter.attackCooldown <= 0 &&
    fighter.stamina >= 12 &&
    fighter.state !== 'slashing' &&
    fighter.state !== 'heavy_slashing' &&
    fighter.state !== 'parrying'
  ) {
    fighter.state = 'slashing';
    fighter.stateTimer = 0.35;
    fighter.slashType = 'light';
    fighter.stamina = Math.max(0, fighter.stamina - 12);
    fighter.hitboxActive = false;
    fighter.attackCooldown = 0.4;
    state.soundEvents.push('slash');
    return;
  }

  // Parry input
  if (
    input.parry &&
    fighter.state !== 'slashing' &&
    fighter.state !== 'heavy_slashing' &&
    fighter.state !== 'dashing'
  ) {
    if (fighter.state !== 'parrying') {
      fighter.state = 'parrying';
      fighter.stateTimer = 0.4;
      fighter.parryWindowActive = true;
    }
    return;
  }

  // Dash input
  if (
    input.dash &&
    fighter.dashCooldown <= 0 &&
    fighter.stamina >= 18 &&
    fighter.state !== 'dashing'
  ) {
    fighter.state = 'dashing';
    fighter.stateTimer = 0.22;
    fighter.stamina = Math.max(0, fighter.stamina - 18);
    fighter.dashCooldown = 0.75;
    state.soundEvents.push('dash');
    return;
  }

  // Jump input
  if (
    input.jump &&
    fighter.isGrounded &&
    fighter.state !== 'slashing' &&
    fighter.state !== 'heavy_slashing' &&
    fighter.state !== 'dashing'
  ) {
    fighter.vy = -13;
    fighter.isGrounded = false;
  }

  // Movement input
  if (fighter.state === 'idle' || fighter.state === 'walking') {
    let moving = false;
    const speed = 220;
    if (input.moveLeft) {
      fighter.x -= speed * 0.016;
      moving = true;
    }
    if (input.moveRight) {
      fighter.x += speed * 0.016;
      moving = true;
    }

    fighter.state = moving ? 'walking' : 'idle';

    // Auto-face opponent
    if (fighter.x < otherFighter.x) {
      fighter.facing = 1;
    } else {
      fighter.facing = -1;
    }
  }
}

export function updateAI(ai: Fighter, player: Fighter, state: SwordFightState, dt: number): void {
  if (state.status !== 'fighting') return;
  if (ai.state === 'staggered' || ai.state === 'hit' || ai.state === 'dead') return;

  const dist = Math.abs(ai.x - player.x);
  const diffMultiplier =
    state.difficulty === 'easy'
      ? 0.4
      : state.difficulty === 'normal'
        ? 0.7
        : state.difficulty === 'hard'
          ? 0.9
          : 1.0;

  // React to player attacks (parry or dodge chance)
  if (
    (player.state === 'slashing' || player.state === 'heavy_slashing') &&
    dist < ATTACK_RANGE + 20
  ) {
    if (
      ai.state !== 'parrying' &&
      ai.state !== 'dashing' &&
      Math.random() < 0.65 * diffMultiplier
    ) {
      if (player.state === 'heavy_slashing' && Math.random() < 0.6) {
        // Dash away from heavy attacks
        handleFighterInput(ai, { dash: true }, player, state);
      } else {
        handleFighterInput(ai, { parry: true }, player, state);
      }
      return;
    }
  }

  // Tactical spacing
  if (ai.state === 'idle' || ai.state === 'walking') {
    if (dist > ATTACK_RANGE - 15) {
      // Advance toward player
      const dir = ai.x < player.x ? 1 : -1;
      ai.x += dir * 180 * dt;
      ai.state = 'walking';
    } else if (dist < 45 && Math.random() < 0.4) {
      // Step back if too close
      const dir = ai.x < player.x ? -1 : 1;
      ai.x += dir * 140 * dt;
      ai.state = 'walking';
    } else {
      ai.state = 'idle';
      // Attack opportunities
      if (ai.attackCooldown <= 0 && ai.stamina >= 20) {
        if (Math.random() < 0.5 * diffMultiplier) {
          if (Math.random() < 0.3) {
            handleFighterInput(ai, { heavySlash: true }, player, state);
          } else {
            handleFighterInput(ai, { slash: true }, player, state);
          }
        }
      }
    }
  }

  // Auto face player
  ai.facing = ai.x < player.x ? 1 : -1;
}

export function spawnSparks(
  x: number,
  y: number,
  color: string,
  count: number,
  state: SwordFightState,
): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 220;
    state.sparks.push({
      id: Math.random().toString(36).slice(2, 9),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      color,
      size: 2 + Math.random() * 3,
      life: 0.3 + Math.random() * 0.3,
      maxLife: 0.6,
    });
  }
}

export function spawnFloatingText(
  text: string,
  x: number,
  y: number,
  color: string,
  state: SwordFightState,
): void {
  state.floatingTexts.push({
    id: Math.random().toString(36).slice(2, 9),
    text,
    x,
    y,
    color,
    opacity: 1,
    life: 0.9,
  });
}

export function checkHitRegistration(
  attacker: Fighter,
  defender: Fighter,
  state: SwordFightState,
): void {
  if (!attacker.hitboxActive) return;
  const dist = Math.abs(attacker.x - defender.x);
  const correctDirection =
    (attacker.facing === 1 && defender.x > attacker.x) ||
    (attacker.facing === -1 && defender.x < attacker.x);

  if (dist <= ATTACK_RANGE && correctDirection) {
    attacker.hitboxActive = false; // hit consumed

    const contactX = (attacker.x + defender.x) / 2;
    const contactY = ARENA_FLOOR_Y - 50 + (attacker.y + defender.y) / 2;

    // Clash detection: If defender is also slashing
    if (defender.hitboxActive) {
      defender.hitboxActive = false;
      attacker.state = 'idle';
      defender.state = 'idle';
      attacker.x -= attacker.facing * 35;
      defender.x -= defender.facing * 35;
      spawnSparks(contactX, contactY, '#f59e0b', 16, state);
      spawnFloatingText('CLASH!', contactX, contactY - 20, '#fbbf24', state);
      state.soundEvents.push('clash');
      return;
    }

    // Invulnerable during dash
    if (defender.state === 'dashing') {
      spawnFloatingText('EVADE', defender.x, ARENA_FLOOR_Y - 70, '#38bdf8', state);
      return;
    }

    const isHeavy = attacker.slashType === 'heavy';
    const baseDamage = isHeavy ? HEAVY_ATTACK_DAMAGE : LIGHT_ATTACK_DAMAGE;
    const postureDmg = isHeavy ? HEAVY_POSTURE_DAMAGE : LIGHT_POSTURE_DAMAGE;

    // Perfect Parry Check
    if (defender.state === 'parrying' && defender.parryWindowActive) {
      // Perfect parry! Deflect attacker
      attacker.state = 'staggered';
      attacker.stateTimer = 0.8;
      attacker.posture = Math.min(
        attacker.maxPosture,
        attacker.posture + PARRY_DEFLECT_POSTURE_DAMAGE,
      );
      defender.posture = Math.max(0, defender.posture - 15);
      defender.stamina = Math.min(defender.maxStamina, defender.stamina + 20);

      spawnSparks(contactX, contactY, '#38bdf8', 22, state);
      spawnFloatingText('PERFECT PARRY!', defender.x, ARENA_FLOOR_Y - 80, '#38bdf8', state);
      state.soundEvents.push('parry');

      if (attacker.id === 'p2') {
        state.score += 150;
      }
      return;
    }

    // Guarding (holding block after window)
    if (defender.state === 'parrying') {
      // Guard holds for light attacks, but heavy attacks crush through
      if (isHeavy) {
        defender.health = Math.max(0, defender.health - Math.floor(baseDamage * 0.6));
        defender.posture = Math.min(defender.maxPosture, defender.posture + postureDmg);
        defender.state = 'hit';
        defender.stateTimer = 0.3;
        spawnSparks(contactX, contactY, '#ef4444', 12, state);
        spawnFloatingText('GUARD CRUSH!', defender.x, ARENA_FLOOR_Y - 80, '#ef4444', state);
        state.soundEvents.push('hit');
      } else {
        defender.posture = Math.min(defender.maxPosture, defender.posture + postureDmg);
        spawnSparks(contactX, contactY, '#94a3b8', 10, state);
        spawnFloatingText('BLOCKED', defender.x, ARENA_FLOOR_Y - 70, '#cbd5e1', state);
        state.soundEvents.push('block');
      }
    } else {
      // Direct clean hit
      const postureBonus = defender.state === 'staggered' ? 1.5 : 1.0;
      const finalDmg = Math.floor(baseDamage * postureBonus);
      defender.health = Math.max(0, defender.health - finalDmg);
      defender.posture = Math.min(defender.maxPosture, defender.posture + postureDmg);
      defender.state = defender.health <= 0 ? 'dead' : 'hit';
      defender.stateTimer = 0.35;
      defender.x += attacker.facing * (isHeavy ? 40 : 20);

      spawnSparks(contactX, contactY, '#f43f5e', 18, state);
      spawnFloatingText(`-${finalDmg}`, defender.x, ARENA_FLOOR_Y - 75, '#f43f5e', state);
      state.soundEvents.push('hit');

      if (attacker.id === 'p1') {
        state.score += finalDmg * 10;
      }
    }

    // Posture break check
    if (defender.posture >= defender.maxPosture && defender.state !== 'dead') {
      defender.state = 'staggered';
      defender.stateTimer = STAGGER_DURATION;
      defender.posture = 0;
      spawnFloatingText('POSTURE BROKEN!', defender.x, ARENA_FLOOR_Y - 95, '#eab308', state);
      state.soundEvents.push('posture_break');
    }
  }
}

export function stepSwordFightEngine(
  state: SwordFightState,
  inputs: { p1: PlayerInput; p2?: PlayerInput },
  rawDt: number,
): SwordFightState {
  const dt = Math.min(Math.max(rawDt, 0.001), 0.1);
  const next: SwordFightState = {
    ...state,
    soundEvents: [],
  };

  // 1. Sparks & floating text updates
  next.sparks = state.sparks
    .map((s) => ({
      ...s,
      x: s.x + s.vx * dt,
      y: s.y + s.vy * dt,
      vy: s.vy + 280 * dt, // gravity
      life: s.life - dt,
    }))
    .filter((s) => s.life > 0);

  next.floatingTexts = state.floatingTexts
    .map((ft) => ({
      ...ft,
      y: ft.y - 30 * dt,
      life: ft.life - dt,
      opacity: Math.max(0, ft.life / 0.9),
    }))
    .filter((ft) => ft.life > 0);

  // 2. Countdown phase
  if (next.status === 'countdown') {
    next.countdownTimer -= dt;
    if (next.countdownTimer <= 0) {
      next.status = 'fighting';
      spawnFloatingText('DUEL BEGINS!', ARENA_WIDTH / 2, ARENA_FLOOR_Y - 140, '#f59e0b', next);
    }
    return next;
  }

  // 3. Match / Round Over state
  if (next.status === 'round_over') {
    next.countdownTimer -= dt;
    if (next.countdownTimer <= 0) {
      if (next.p1.roundsWon >= 2 || next.p2.roundsWon >= 2) {
        next.status = 'match_over';
        next.matchWinner = next.p1.roundsWon >= 2 ? 'p1' : 'p2';
        next.soundEvents.push('match_win');
      } else {
        // Reset for next round
        next.round += 1;
        next.status = 'countdown';
        next.countdownTimer = 1.5;
        next.roundWinner = null;
        next.p1 = {
          ...createInitialFighter('p1', 'Player 1', 260, 1),
          roundsWon: next.p1.roundsWon,
        };
        next.p2 = {
          ...createInitialFighter('p2', next.isTwoPlayer ? 'Player 2' : 'Ronin AI', 540, -1),
          roundsWon: next.p2.roundsWon,
        };
      }
    }
    return next;
  }

  if (next.status === 'match_over') {
    return next;
  }

  // 4. Timer decrement
  next.timeRemaining = Math.max(0, next.timeRemaining - dt);
  if (next.timeRemaining <= 0) {
    // Time out: highest health wins round
    const p1Health = next.p1.health;
    const p2Health = next.p2.health;
    const winnerId = p1Health >= p2Health ? 'p1' : 'p2';
    return handleRoundEnd(next, winnerId);
  }

  // 5. Inputs & AI
  handleFighterInput(next.p1, inputs.p1, next.p2, next);
  if (next.isTwoPlayer && inputs.p2) {
    handleFighterInput(next.p2, inputs.p2, next.p1, next);
  } else {
    updateAI(next.p2, next.p1, next, dt);
  }

  // 6. Update fighters
  updateFighter(next.p1, dt);
  updateFighter(next.p2, dt);

  // 7. Check hitboxes
  checkHitRegistration(next.p1, next.p2, next);
  checkHitRegistration(next.p2, next.p1, next);

  // 8. Arena bounds & distance clamping
  clampFighterToArena(next.p1);
  clampFighterToArena(next.p2);

  // 9. Round victory checks
  if (next.p1.health <= 0 || next.p2.health <= 0) {
    const winnerId = next.p1.health <= 0 ? 'p2' : 'p1';
    return handleRoundEnd(next, winnerId);
  }

  return next;
}

function updateFighter(f: Fighter, dt: number): void {
  // Stamina regen
  if (f.state !== 'slashing' && f.state !== 'heavy_slashing' && f.state !== 'dashing') {
    f.stamina = Math.min(f.maxStamina, f.stamina + 28 * dt);
  }

  // Posture decay if not blocking
  if (f.state !== 'parrying' && f.state !== 'hit' && f.state !== 'staggered') {
    f.posture = Math.max(0, f.posture - 12 * dt);
  }

  // Cooldowns
  if (f.attackCooldown > 0) f.attackCooldown = Math.max(0, f.attackCooldown - dt);
  if (f.dashCooldown > 0) f.dashCooldown = Math.max(0, f.dashCooldown - dt);

  // Jump physics
  if (!f.isGrounded) {
    f.y += f.vy;
    f.vy += 28 * dt; // gravity
    if (f.y >= 0) {
      f.y = 0;
      f.vy = 0;
      f.isGrounded = true;
    }
  }

  // State timers
  if (f.stateTimer > 0) {
    f.stateTimer -= dt;

    // Dash motion
    if (f.state === 'dashing') {
      f.x += f.facing * -280 * dt; // quick backward evasion
    }

    // Attack hitbox activation window (impact frame)
    if (f.state === 'slashing') {
      if (f.stateTimer < 0.22 && f.stateTimer > 0.08) {
        f.hitboxActive = true;
      } else {
        f.hitboxActive = false;
      }
    } else if (f.state === 'heavy_slashing') {
      if (f.stateTimer < 0.25 && f.stateTimer > 0.08) {
        f.hitboxActive = true;
      } else {
        f.hitboxActive = false;
      }
    }

    // Parry window active for first 0.22s
    if (f.state === 'parrying') {
      f.parryWindowActive = f.stateTimer > 0.4 - PARRY_WINDOW_DURATION;
    }

    if (f.stateTimer <= 0) {
      f.state = 'idle';
      f.slashType = null;
      f.parryWindowActive = false;
      f.hitboxActive = false;
    }
  }
}

function clampFighterToArena(f: Fighter): void {
  f.x = Math.max(60, Math.min(ARENA_WIDTH - 60, f.x));
}

function handleRoundEnd(state: SwordFightState, winnerId: 'p1' | 'p2'): SwordFightState {
  state.status = 'round_over';
  state.roundWinner = winnerId;
  state.countdownTimer = 2.5;

  if (winnerId === 'p1') {
    state.p1.roundsWon += 1;
    state.score += 500;
  } else {
    state.p2.roundsWon += 1;
  }

  state.soundEvents.push('round_win');
  spawnFloatingText(
    `${winnerId === 'p1' ? state.p1.name : state.p2.name} WINS ROUND!`,
    ARENA_WIDTH / 2,
    ARENA_FLOOR_Y - 120,
    winnerId === 'p1' ? '#38bdf8' : '#f43f5e',
    state,
  );

  return state;
}
