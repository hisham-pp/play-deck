export type NinjaAction =
  | 'idle'
  | 'walking'
  | 'crouching'
  | 'jumping'
  | 'throwing'
  | 'takedown'
  | 'dead';

export type GuardState = 'patrolling' | 'suspicious' | 'alerted' | 'stunned' | 'eliminated';

export interface Guard {
  id: string;
  name: string;
  x: number;
  y: number;
  facing: 1 | -1;
  patrolMinX: number;
  patrolMaxX: number;
  speed: number;
  state: GuardState;
  alertMeter: number; // 0 to 100
  suspicionX: number | null;
  stateTimer: number;
}

export interface Shuriken {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  embedded: boolean;
}

export interface SmokeCloud {
  id: string;
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  isShadow?: boolean;
}

export type NinjaSoundEvent =
  | 'shuriken_throw'
  | 'shuriken_hit'
  | 'takedown'
  | 'smoke_bomb'
  | 'alert'
  | 'alarm'
  | 'scroll_collected'
  | 'level_clear'
  | 'game_over';

export interface NinjaPlayer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  isGrounded: boolean;
  isCrouched: boolean;
  isHiding: boolean;
  health: number;
  maxHealth: number;
  shurikens: number;
  smokeBombs: number;
  noiseRadius: number;
  state: NinjaAction;
  stateTimer: number;
}

export interface NinjaGameState {
  status: 'playing' | 'level_clear' | 'game_over';
  level: number;
  score: number;
  stealthBonus: number;
  player: NinjaPlayer;
  guards: Guard[];
  shurikens: Shuriken[];
  smokeClouds: SmokeCloud[];
  platforms: Platform[];
  scrollX: number;
  scrollY: number;
  scrollCollected: boolean;
  alarmTriggered: boolean;
  soundEvents: NinjaSoundEvent[];
}

export const ARENA_WIDTH = 800;
export const ARENA_FLOOR_Y = 380;
export const GRAVITY = 750;
export const PLAYER_SPEED = 200;
export const CROUCH_SPEED = 90;
export const JUMP_VELOCITY = -390;
export const GUARD_VISION_DISTANCE = 210;
export const TAKEDOWN_RANGE = 45;

export function createInitialPlatforms(level: number): Platform[] {
  // Ground
  const platforms: Platform[] = [
    { x: 0, y: ARENA_FLOOR_Y, width: ARENA_WIDTH, height: 100 },
  ];

  if (level === 1) {
    // Castle Courtyard rafters & hiding alcove
    platforms.push(
      { x: 120, y: 270, width: 140, height: 14, isShadow: true },
      { x: 340, y: 210, width: 160, height: 14 },
      { x: 580, y: 260, width: 150, height: 14, isShadow: true },
    );
  } else if (level === 2) {
    // Pagoda Tier multi-level rafters
    platforms.push(
      { x: 80, y: 290, width: 120, height: 14 },
      { x: 260, y: 220, width: 150, height: 14, isShadow: true },
      { x: 470, y: 160, width: 160, height: 14 },
      { x: 670, y: 240, width: 110, height: 14, isShadow: true },
    );
  } else {
    // Fortress Inner Vault
    platforms.push(
      { x: 60, y: 260, width: 100, height: 14, isShadow: true },
      { x: 220, y: 190, width: 130, height: 14 },
      { x: 420, y: 140, width: 140, height: 14, isShadow: true },
      { x: 620, y: 210, width: 140, height: 14 },
    );
  }

  return platforms;
}

export function createGuardsForLevel(level: number): Guard[] {
  if (level === 1) {
    return [
      {
        id: 'g1',
        name: 'Sentry Akio',
        x: 320,
        y: ARENA_FLOOR_Y,
        facing: 1,
        patrolMinX: 260,
        patrolMaxX: 460,
        speed: 55,
        state: 'patrolling',
        alertMeter: 0,
        suspicionX: null,
        stateTimer: 0,
      },
      {
        id: 'g2',
        name: 'Sentry Ren',
        x: 620,
        y: ARENA_FLOOR_Y,
        facing: -1,
        patrolMinX: 520,
        patrolMaxX: 720,
        speed: 65,
        state: 'patrolling',
        alertMeter: 0,
        suspicionX: null,
        stateTimer: 0,
      },
    ];
  } else if (level === 2) {
    return [
      {
        id: 'g1',
        name: 'Patrol Kuro',
        x: 220,
        y: ARENA_FLOOR_Y,
        facing: 1,
        patrolMinX: 160,
        patrolMaxX: 380,
        speed: 65,
        state: 'patrolling',
        alertMeter: 0,
        suspicionX: null,
        stateTimer: 0,
      },
      {
        id: 'g2',
        name: 'Rafter Guard Jin',
        x: 340,
        y: 220,
        facing: 1,
        patrolMinX: 270,
        patrolMaxX: 400,
        speed: 50,
        state: 'patrolling',
        alertMeter: 0,
        suspicionX: null,
        stateTimer: 0,
      },
      {
        id: 'g3',
        name: 'Gatekeeper Taro',
        x: 620,
        y: ARENA_FLOOR_Y,
        facing: -1,
        patrolMinX: 500,
        patrolMaxX: 740,
        speed: 75,
        state: 'patrolling',
        alertMeter: 0,
        suspicionX: null,
        stateTimer: 0,
      },
    ];
  } else {
    return [
      {
        id: 'g1',
        name: 'Elite Guard Kage',
        x: 200,
        y: ARENA_FLOOR_Y,
        facing: 1,
        patrolMinX: 120,
        patrolMaxX: 360,
        speed: 80,
        state: 'patrolling',
        alertMeter: 0,
        suspicionX: null,
        stateTimer: 0,
      },
      {
        id: 'g2',
        name: 'Watchman Hideo',
        x: 300,
        y: 190,
        facing: 1,
        patrolMinX: 230,
        patrolMaxX: 340,
        speed: 60,
        state: 'patrolling',
        alertMeter: 0,
        suspicionX: null,
        stateTimer: 0,
      },
      {
        id: 'g3',
        name: 'Vault Warlord Raiden',
        x: 640,
        y: ARENA_FLOOR_Y,
        facing: -1,
        patrolMinX: 520,
        patrolMaxX: 750,
        speed: 85,
        state: 'patrolling',
        alertMeter: 0,
        suspicionX: null,
        stateTimer: 0,
      },
    ];
  }
}

export function createInitialNinjaState(level = 1, preservedScore = 0): NinjaGameState {
  return {
    status: 'playing',
    level,
    score: preservedScore,
    stealthBonus: 500,
    player: {
      x: 60,
      y: ARENA_FLOOR_Y,
      vx: 0,
      vy: 0,
      facing: 1,
      isGrounded: true,
      isCrouched: false,
      isHiding: false,
      health: 100,
      maxHealth: 100,
      shurikens: 5,
      smokeBombs: 2,
      noiseRadius: 0,
      state: 'idle',
      stateTimer: 0,
    },
    guards: createGuardsForLevel(level),
    shurikens: [],
    smokeClouds: [],
    platforms: createInitialPlatforms(level),
    scrollX: 740,
    scrollY: level === 3 ? 140 : ARENA_FLOOR_Y,
    scrollCollected: false,
    alarmTriggered: false,
    soundEvents: [],
  };
}

export interface NinjaInputs {
  moveLeft?: boolean;
  moveRight?: boolean;
  crouch?: boolean;
  jump?: boolean;
  throwShuriken?: { targetX: number; targetY: number } | null;
  deploySmoke?: boolean;
  takedown?: boolean;
}

export function stepNinjaEngine(
  state: NinjaGameState,
  inputs: NinjaInputs,
  rawDt: number,
): NinjaGameState {
  const dt = Math.min(Math.max(rawDt, 0.001), 0.1);
  const next: NinjaGameState = {
    ...state,
    soundEvents: [],
  };

  if (next.status !== 'playing') {
    return next;
  }

  const p = { ...next.player };

  // 1. Process Smoke Clouds
  next.smokeClouds = next.smokeClouds
    .map((sc) => ({ ...sc, life: sc.life - dt }))
    .filter((sc) => sc.life > 0);

  // 2. Takedown action processing
  if (p.state === 'takedown') {
    p.stateTimer -= dt;
    if (p.stateTimer <= 0) {
      p.state = 'idle';
    }
  } else if (p.state !== 'dead') {
    // 3. Smoke Bomb Input
    if (inputs.deploySmoke && p.smokeBombs > 0) {
      p.smokeBombs -= 1;
      next.smokeClouds.push({
        id: Math.random().toString(36).slice(2, 9),
        x: p.x,
        y: p.y - 20,
        radius: 110,
        life: 4.5,
        maxLife: 4.5,
      });
      next.soundEvents.push('smoke_bomb');
      // Confuse nearby guards
      for (const g of next.guards) {
        if (Math.hypot(g.x - p.x, g.y - p.y) < 130 && g.state !== 'eliminated') {
          g.state = 'stunned';
          g.stateTimer = 3.5;
          g.alertMeter = Math.max(0, g.alertMeter - 40);
        }
      }
    }

    // 4. Shuriken Throw Input
    if (inputs.throwShuriken && p.shurikens > 0 && p.state !== 'throwing') {
      p.shurikens -= 1;
      p.state = 'throwing';
      p.stateTimer = 0.25;

      const dx = inputs.throwShuriken.targetX - p.x;
      const dy = inputs.throwShuriken.targetY - (p.y - 30);
      const angle = Math.atan2(dy, dx);
      const speed = 520;

      next.shurikens.push({
        id: Math.random().toString(36).slice(2, 9),
        x: p.x + (p.facing * 15),
        y: p.y - 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        active: true,
        embedded: false,
      });

      p.noiseRadius = 150;
      next.soundEvents.push('shuriken_throw');
    }

    if (p.state === 'throwing') {
      p.stateTimer -= dt;
      if (p.stateTimer <= 0) {
        p.state = 'idle';
      }
    }

    // 5. Silent Takedown Check (Behind enemy, close range)
    if (inputs.takedown) {
      for (const g of next.guards) {
        if (g.state !== 'eliminated') {
          const dist = Math.hypot(g.x - p.x, g.y - p.y);
          // Check if behind guard
          const isBehind = (g.facing === 1 && p.x < g.x) || (g.facing === -1 && p.x > g.x);
          const isOverheadDrop = Math.abs(g.x - p.x) < 35 && p.y < g.y - 10 && !p.isGrounded;

          if ((dist < TAKEDOWN_RANGE && isBehind) || isOverheadDrop) {
            g.state = 'eliminated';
            g.alertMeter = 0;
            p.state = 'takedown';
            p.stateTimer = 0.6;
            next.score += 250;
            next.soundEvents.push('takedown');
            break;
          }
        }
      }
    }

    // 6. Movement & Crouch
    p.isCrouched = !!inputs.crouch;

    let moveX = 0;
    if (inputs.moveLeft) {
      moveX -= 1;
      p.facing = -1;
    }
    if (inputs.moveRight) {
      moveX += 1;
      p.facing = 1;
    }

    const currentSpeed = p.isCrouched ? CROUCH_SPEED : PLAYER_SPEED;
    p.vx = moveX * currentSpeed;

    // Noise radius calculation
    const currentState = p.state as NinjaAction;
    if (currentState !== 'takedown' && currentState !== 'throwing') {
      if (moveX !== 0) {
        p.state = p.isCrouched ? 'crouching' : 'walking';
        p.noiseRadius = p.isCrouched ? 35 : 120;
      } else {
        p.state = p.isCrouched ? 'crouching' : 'idle';
        p.noiseRadius = 0;
      }
    }

    // Jump
    if (inputs.jump && p.isGrounded && !p.isCrouched) {
      p.vy = JUMP_VELOCITY;
      p.isGrounded = false;
      p.state = 'jumping';
      p.noiseRadius = 160;
    }

    // Gravity
    p.vy += GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Platform collisions
    p.isGrounded = false;
    for (const plat of next.platforms) {
      if (
        p.x >= plat.x - 10 &&
        p.x <= plat.x + plat.width + 10 &&
        p.y >= plat.y &&
        p.y - p.vy * dt <= plat.y + 12
      ) {
        p.y = plat.y;
        p.vy = 0;
        p.isGrounded = true;
      }
    }

    // Clamp to screen bounds
    p.x = Math.max(20, Math.min(ARENA_WIDTH - 20, p.x));

    // Check if hiding in shadow platform or inside smoke
    const insideSmoke = next.smokeClouds.some(
      (sc) => Math.hypot(sc.x - p.x, sc.y - p.y) < sc.radius,
    );
    const inShadowAlcove = next.platforms.some(
      (plat) =>
        plat.isShadow &&
        p.x >= plat.x &&
        p.x <= plat.x + plat.width &&
        Math.abs(p.y - plat.y) < 5 &&
        (p.isCrouched || p.state === 'idle'),
    );

    p.isHiding = insideSmoke || inShadowAlcove;
  }

  next.player = p;

  // 7. Update Shurikens
  next.shurikens = next.shurikens
    .map((s) => {
      if (!s.active) return s;
      const nextX = s.x + s.vx * dt;
      const nextY = s.y + s.vy * dt;

      // Check collision with guards
      for (const g of next.guards) {
        if (g.state !== 'eliminated') {
          if (Math.hypot(g.x - nextX, (g.y - 25) - nextY) < 22) {
            g.state = 'eliminated';
            next.score += 150;
            next.soundEvents.push('shuriken_hit');
            return { ...s, x: nextX, y: nextY, active: false, embedded: true };
          }
        }
      }

      // Check collision with platforms or floor
      if (nextY >= ARENA_FLOOR_Y || nextX < 0 || nextX > ARENA_WIDTH) {
        return { ...s, x: Math.max(0, Math.min(ARENA_WIDTH, nextX)), y: Math.min(ARENA_FLOOR_Y, nextY), active: false, embedded: true };
      }

      return { ...s, x: nextX, y: nextY };
    })
    .filter((s) => s.active || s.embedded);

  // 8. Update Guards AI & Perception
  for (const g of next.guards) {
    if (g.state === 'eliminated') continue;

    if (g.state === 'stunned') {
      g.stateTimer -= dt;
      if (g.stateTimer <= 0) {
        g.state = 'suspicious';
        g.stateTimer = 2.0;
      }
      continue;
    }

    // Vision cone detection
    const dx = p.x - g.x;
    const dy = p.y - g.y;
    const dist = Math.hypot(dx, dy);
    const facingPlayer = (g.facing === 1 && dx > 0) || (g.facing === -1 && dx < 0);

    const canSeePlayer =
      !p.isHiding &&
      facingPlayer &&
      dist < GUARD_VISION_DISTANCE &&
      Math.abs(dy) < 65;

    // Noise detection
    const canHearPlayer = !p.isHiding && dist < p.noiseRadius;

    if (canSeePlayer) {
      g.alertMeter = Math.min(100, g.alertMeter + 85 * dt);
      g.suspicionX = p.x;
      if (g.alertMeter >= 100) {
        g.state = 'alerted';
        if (!next.alarmTriggered) {
          next.alarmTriggered = true;
          next.stealthBonus = 0;
          next.soundEvents.push('alarm');
        }
      } else {
        g.state = 'suspicious';
        next.soundEvents.push('alert');
      }
    } else if (canHearPlayer) {
      g.alertMeter = Math.min(100, g.alertMeter + 40 * dt);
      g.suspicionX = p.x;
      g.state = 'suspicious';
    } else {
      // Alert decay
      g.alertMeter = Math.max(0, g.alertMeter - 18 * dt);
      if (g.alertMeter === 0 && g.state !== 'alerted') {
        g.state = 'patrolling';
        g.suspicionX = null;
      }
    }

    // Guard Movement
    if (g.state === 'alerted') {
      // Run toward player
      const dir = p.x > g.x ? 1 : -1;
      g.facing = dir;
      g.x += dir * g.speed * 1.5 * dt;

      // Close combat contact: damages player
      if (dist < 32 && p.state !== 'dead') {
        p.health = Math.max(0, p.health - 45 * dt);
        if (p.health <= 0) {
          p.state = 'dead';
          next.status = 'game_over';
          next.soundEvents.push('game_over');
        }
      }
    } else if (g.state === 'suspicious' && g.suspicionX !== null) {
      // Walk to suspicious spot
      const sDir = g.suspicionX > g.x ? 1 : -1;
      g.facing = sDir;
      g.x += sDir * g.speed * dt;
      if (Math.abs(g.suspicionX - g.x) < 15) {
        g.suspicionX = null;
      }
    } else {
      // Standard patrol
      g.x += g.facing * g.speed * dt;
      if (g.x >= g.patrolMaxX) {
        g.facing = -1;
      } else if (g.x <= g.patrolMinX) {
        g.facing = 1;
      }
    }
  }

  // 9. Scroll objective check
  if (!next.scrollCollected) {
    if (Math.hypot(p.x - next.scrollX, p.y - next.scrollY) < 36) {
      next.scrollCollected = true;
      next.score += 500 + next.stealthBonus;
      next.soundEvents.push('scroll_collected');
      next.soundEvents.push('level_clear');
      next.status = 'level_clear';
    }
  }

  // Check if all guards eliminated
  const allEliminated = next.guards.every((g) => g.state === 'eliminated');
  if (allEliminated && !next.scrollCollected) {
    next.scrollCollected = true;
    next.score += 600 + next.stealthBonus;
    next.soundEvents.push('level_clear');
    next.status = 'level_clear';
  }

  return next;
}
