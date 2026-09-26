/**
 * Stickman Shooter — Core Game Engine
 * Framework-agnostic pure TypeScript simulation for tactical cover shooting,
 * enemy AI targeting, projectile calculations, wave progression, and combo scoring.
 */

export type ShooterPosture = 'cover' | 'aiming';
export type EnemyType = 'rifleman' | 'sniper' | 'heavy' | 'boss';
export type EnemyState = 'hiding' | 'emerging' | 'aiming' | 'shooting' | 'dead';
export type GameStatus = 'ready' | 'playing' | 'wave_cleared' | 'game_over';

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  lifetime: number;
  maxLifetime: number;
}

export interface BulletTracer {
  id: string;
  from: 'player' | 'enemy';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  lifetime: number;
  color: string;
  isHeadshot?: boolean;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  baseY: number;
  health: number;
  maxHealth: number;
  state: EnemyState;
  stateTimer: number;
  aimDuration: number;
  shootCooldown: number;
  attackDamage: number;
  scoreValue: number;
  headRadius: number;
  bodyWidth: number;
  bodyHeight: number;
  isTelegraphing: boolean;
}

export interface PlayerStats {
  shotsFired: number;
  shotsHit: number;
  headshots: number;
  enemiesKilled: number;
}

export interface StickmanShooterState {
  status: GameStatus;
  player: {
    x: number;
    y: number;
    posture: ShooterPosture;
    health: number;
    maxHealth: number;
    ammo: number;
    maxAmmo: number;
    isReloading: boolean;
    reloadTimer: number;
    reloadDuration: number;
    fireCooldown: number;
  };
  enemies: Enemy[];
  tracers: BulletTracer[];
  floatingTexts: FloatingText[];
  wave: number;
  waveTransitionTimer: number;
  score: number;
  highScore: number;
  combo: number;
  comboMultiplier: number;
  comboTimer: number;
  stats: PlayerStats;
}

export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;
export const PLAYER_COVER_X = 140;
export const PLAYER_COVER_Y = 410;
export const RELOAD_DURATION_SEC = 1.1;
export const FIRE_COOLDOWN_SEC = 0.22;
export const MAX_COMBO_TIMER = 3.5;

let idCounter = 0;
function uniqueId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++idCounter}`;
}

export function createInitialShooterState(highScore = 0): StickmanShooterState {
  return {
    status: 'ready',
    player: {
      x: PLAYER_COVER_X,
      y: PLAYER_COVER_Y,
      posture: 'cover',
      health: 100,
      maxHealth: 100,
      ammo: 10,
      maxAmmo: 10,
      isReloading: false,
      reloadTimer: 0,
      reloadDuration: RELOAD_DURATION_SEC,
      fireCooldown: 0,
    },
    enemies: [],
    tracers: [],
    floatingTexts: [],
    wave: 1,
    waveTransitionTimer: 0,
    score: 0,
    highScore,
    combo: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    stats: {
      shotsFired: 0,
      shotsHit: 0,
      headshots: 0,
      enemiesKilled: 0,
    },
  };
}

export function spawnWaveEnemies(wave: number): Enemy[] {
  const count = Math.min(3 + wave, 7);
  const enemies: Enemy[] = [];
  
  // Available bunker / cover horizontal slots across the battlefield
  const spawnSlots = [
    { x: 380, y: 360 },
    { x: 490, y: 310 },
    { x: 600, y: 370 },
    { x: 710, y: 320 },
    { x: 820, y: 350 },
    { x: 440, y: 240 },
    { x: 670, y: 250 },
  ];

  // Pick random or staggered slots
  const shuffledSlots = [...spawnSlots].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    const slot = shuffledSlots[i % shuffledSlots.length];
    
    // Choose enemy archetype based on wave
    let type: EnemyType = 'rifleman';
    let maxHealth = 35;
    let aimDuration = Math.max(1.8 - wave * 0.1, 0.9);
    let attackDamage = 15;
    let scoreValue = 100;
    let headRadius = 14;
    let bodyWidth = 24;
    let bodyHeight = 50;

    if (wave >= 3 && i === count - 1) {
      type = 'sniper';
      maxHealth = 25;
      aimDuration = Math.max(2.4 - wave * 0.08, 1.4);
      attackDamage = 35;
      scoreValue = 220;
    } else if (wave >= 4 && i % 2 === 1) {
      type = 'heavy';
      maxHealth = 70;
      aimDuration = 2.0;
      attackDamage = 20;
      scoreValue = 250;
      headRadius = 15;
      bodyWidth = 30;
      bodyHeight = 54;
    } else if (wave % 5 === 0 && i === 0) {
      type = 'boss';
      maxHealth = 150 + wave * 25;
      aimDuration = 1.6;
      attackDamage = 30;
      scoreValue = 800;
      headRadius = 18;
      bodyWidth = 36;
      bodyHeight = 65;
    }

    enemies.push({
      id: uniqueId(`enemy_${type}`),
      type,
      x: slot.x + (Math.random() * 20 - 10),
      y: slot.y,
      baseY: slot.y,
      health: maxHealth,
      maxHealth,
      state: 'hiding',
      stateTimer: 0.4 + i * 0.35 + Math.random() * 0.5,
      aimDuration,
      shootCooldown: 0,
      attackDamage,
      scoreValue,
      headRadius,
      bodyWidth,
      bodyHeight,
      isTelegraphing: false,
    });
  }

  return enemies;
}

export function startShooterGame(state: StickmanShooterState): StickmanShooterState {
  const initial = createInitialShooterState(state.highScore);
  return {
    ...initial,
    status: 'playing',
    enemies: spawnWaveEnemies(1),
  };
}

export function setPlayerPosture(
  state: StickmanShooterState,
  posture: ShooterPosture,
): StickmanShooterState {
  if (state.status !== 'playing') return state;
  return {
    ...state,
    player: {
      ...state.player,
      posture,
    },
  };
}

export function togglePlayerPosture(state: StickmanShooterState): StickmanShooterState {
  const nextPosture: ShooterPosture = state.player.posture === 'cover' ? 'aiming' : 'cover';
  return setPlayerPosture(state, nextPosture);
}

export function startReload(state: StickmanShooterState): StickmanShooterState {
  if (state.status !== 'playing') return state;
  if (state.player.isReloading || state.player.ammo >= state.player.maxAmmo) {
    return state;
  }

  return {
    ...state,
    player: {
      ...state.player,
      isReloading: true,
      reloadTimer: state.player.reloadDuration,
    },
    floatingTexts: [
      ...state.floatingTexts,
      {
        id: uniqueId('reload_txt'),
        x: state.player.x,
        y: state.player.y - 45,
        text: 'RELOADING...',
        color: '#F59E0B',
        lifetime: 0.9,
        maxLifetime: 0.9,
      },
    ],
  };
}

export interface FireResult {
  state: StickmanShooterState;
  outcome: 'hit' | 'headshot' | 'miss' | 'empty' | 'reloading' | 'in_cover' | 'cooldown';
}

export function firePlayerWeapon(
  state: StickmanShooterState,
  targetX: number,
  targetY: number,
): FireResult {
  if (state.status !== 'playing') {
    return { state, outcome: 'empty' };
  }

  const { player } = state;

  if (player.posture === 'cover') {
    return { state, outcome: 'in_cover' };
  }

  if (player.isReloading) {
    return { state, outcome: 'reloading' };
  }

  if (player.fireCooldown > 0) {
    return { state, outcome: 'cooldown' };
  }

  if (player.ammo <= 0) {
    return {
      state: {
        ...state,
        floatingTexts: [
          ...state.floatingTexts,
          {
            id: uniqueId('empty_txt'),
            x: player.x + 20,
            y: player.y - 40,
            text: '*CLICK* NO AMMO!',
            color: '#EF4444',
            lifetime: 0.8,
            maxLifetime: 0.8,
          },
        ],
      },
      outcome: 'empty',
    };
  }

  // Deduct ammo & set cooldown
  const updatedAmmo = player.ammo - 1;
  const shotsFired = state.stats.shotsFired + 1;

  // Origin point of player rifle muzzle
  const muzzleX = player.x + 40;
  const muzzleY = player.y - 18;

  // Check collision with enemies (priority to alive enemies not in hiding)
  let hitEnemyIndex = -1;
  let isHeadshot = false;

  for (let i = 0; i < state.enemies.length; i++) {
    const enemy = state.enemies[i];
    if (enemy.state === 'dead' || enemy.state === 'hiding') continue;

    // Head hitbox: circle centered above body
    const headY = enemy.y - enemy.bodyHeight - enemy.headRadius;
    const distToHead = Math.hypot(targetX - enemy.x, targetY - headY);

    if (distToHead <= enemy.headRadius + 4) {
      hitEnemyIndex = i;
      isHeadshot = true;
      break;
    }

    // Body hitbox: rectangle centered on enemy.x
    const bodyLeft = enemy.x - enemy.bodyWidth / 2 - 4;
    const bodyRight = enemy.x + enemy.bodyWidth / 2 + 4;
    const bodyTop = enemy.y - enemy.bodyHeight;
    const bodyBottom = enemy.y;

    if (
      targetX >= bodyLeft &&
      targetX <= bodyRight &&
      targetY >= bodyTop &&
      targetY <= bodyBottom
    ) {
      hitEnemyIndex = i;
      isHeadshot = false;
      break;
    }
  }

  const newFloatingTexts = [...state.floatingTexts];
  const newTracers = [
    ...state.tracers,
    {
      id: uniqueId('tracer_p'),
      from: 'player' as const,
      startX: muzzleX,
      startY: muzzleY,
      endX: targetX,
      endY: targetY,
      lifetime: 0.12,
      color: isHeadshot ? '#F59E0B' : '#38BDF8',
      isHeadshot,
    },
  ];

  let nextScore = state.score;
  let nextCombo = state.combo;
  let nextMultiplier = state.comboMultiplier;
  let nextComboTimer = state.comboTimer;
  let shotsHit = state.stats.shotsHit;
  let headshots = state.stats.headshots;
  let enemiesKilled = state.stats.enemiesKilled;
  const updatedEnemies = [...state.enemies];

  let outcome: 'hit' | 'headshot' | 'miss' = 'miss';

  if (hitEnemyIndex >= 0) {
    shotsHit++;
    outcome = isHeadshot ? 'headshot' : 'hit';

    const targetEnemy = { ...updatedEnemies[hitEnemyIndex] };
    const baseDamage = 35;
    const damage = isHeadshot ? baseDamage * 2.5 : baseDamage;

    targetEnemy.health = Math.max(0, targetEnemy.health - damage);

    if (isHeadshot) {
      headshots++;
      nextCombo += 2;
      newFloatingTexts.push({
        id: uniqueId('headshot_txt'),
        x: targetEnemy.x,
        y: targetEnemy.y - targetEnemy.bodyHeight - 30,
        text: `HEADSHOT! +${Math.round(damage)}`,
        color: '#F59E0B',
        lifetime: 0.9,
        maxLifetime: 0.9,
      });
    } else {
      nextCombo += 1;
      newFloatingTexts.push({
        id: uniqueId('hit_txt'),
        x: targetEnemy.x,
        y: targetEnemy.y - targetEnemy.bodyHeight - 15,
        text: `-${Math.round(damage)}`,
        color: '#F8FAFC',
        lifetime: 0.7,
        maxLifetime: 0.7,
      });
    }

    // Update combo multipliers
    nextMultiplier = Math.min(5, 1 + Math.floor(nextCombo / 3));
    nextComboTimer = MAX_COMBO_TIMER;

    if (targetEnemy.health <= 0) {
      targetEnemy.state = 'dead';
      targetEnemy.stateTimer = 1.0; // death fade timer
      enemiesKilled++;
      const earnedScore = targetEnemy.scoreValue * nextMultiplier;
      nextScore += earnedScore;

      newFloatingTexts.push({
        id: uniqueId('kill_txt'),
        x: targetEnemy.x,
        y: targetEnemy.y - targetEnemy.bodyHeight - 40,
        text: `+${earnedScore}`,
        color: '#10B981',
        lifetime: 1.0,
        maxLifetime: 1.0,
      });
    }

    updatedEnemies[hitEnemyIndex] = targetEnemy;
  } else {
    // Shot missed target
    newFloatingTexts.push({
      id: uniqueId('miss_txt'),
      x: targetX,
      y: targetY,
      text: 'MISS',
      color: '#64748B',
      lifetime: 0.5,
      maxLifetime: 0.5,
    });
  }

  const nextHighScore = Math.max(state.highScore, nextScore);

  return {
    state: {
      ...state,
      player: {
        ...player,
        ammo: updatedAmmo,
        fireCooldown: FIRE_COOLDOWN_SEC,
      },
      enemies: updatedEnemies,
      tracers: newTracers,
      floatingTexts: newFloatingTexts,
      score: nextScore,
      highScore: nextHighScore,
      combo: nextCombo,
      comboMultiplier: nextMultiplier,
      comboTimer: nextComboTimer,
      stats: {
        shotsFired,
        shotsHit,
        headshots,
        enemiesKilled,
      },
    },
    outcome,
  };
}

export function stepShooterEngine(
  state: StickmanShooterState,
  deltaSec: number,
): StickmanShooterState {
  if (state.status !== 'playing' && state.status !== 'wave_cleared') {
    return state;
  }

  const dt = Math.max(0, Math.min(deltaSec, 1.5));
  let status: GameStatus = state.status;
  let { wave, waveTransitionTimer, score, highScore } = state;
  const player = { ...state.player };
  let { combo, comboMultiplier, comboTimer } = state;

  // 1. Player Cooldowns & Reload
  if (player.fireCooldown > 0) {
    player.fireCooldown = Math.max(0, player.fireCooldown - dt);
  }

  if (player.isReloading) {
    player.reloadTimer -= dt;
    if (player.reloadTimer <= 0) {
      player.isReloading = false;
      player.ammo = player.maxAmmo;
    }
  }

  // 2. Combo Timer Decay
  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) {
      combo = 0;
      comboMultiplier = 1;
    }
  }

  // 3. Update Visual Tracers & Floating Texts
  const updatedTracers = state.tracers
    .map((t) => ({ ...t, lifetime: t.lifetime - dt }))
    .filter((t) => t.lifetime > 0);

  const updatedFloatingTexts = state.floatingTexts
    .map((f) => ({
      ...f,
      y: f.y - 25 * dt, // float upward
      lifetime: f.lifetime - dt,
    }))
    .filter((f) => f.lifetime > 0);

  // 4. Update Enemies AI
  const updatedEnemies: Enemy[] = [];
  const incomingBulletTracers: BulletTracer[] = [];
  let playerDamageTaken = 0;

  for (const enemy of state.enemies) {
    const updated = { ...enemy };

    if (updated.state === 'dead') {
      updated.stateTimer -= dt;
      if (updated.stateTimer > 0) {
        updatedEnemies.push(updated);
      }
      continue;
    }

    updated.stateTimer -= dt;

    switch (updated.state) {
      case 'hiding':
        updated.isTelegraphing = false;
        if (updated.stateTimer <= 0) {
          updated.state = 'emerging';
          updated.stateTimer = 0.4;
        }
        break;

      case 'emerging':
        if (updated.stateTimer <= 0) {
          updated.state = 'aiming';
          updated.stateTimer = updated.aimDuration;
          updated.isTelegraphing = true;
        }
        break;

      case 'aiming':
        // As state timer winds down, telegraph line turns brighter
        if (updated.stateTimer <= 0) {
          updated.state = 'shooting';
          updated.stateTimer = 0.15;
          updated.isTelegraphing = false;

          // ENEMY FIRES!
          const enemyMuzzleX = updated.x - 20;
          const enemyMuzzleY = updated.y - updated.bodyHeight / 2;

          let targetX = player.x;
          let targetY = player.y - 20;

          if (player.posture === 'cover') {
            // Bullet strikes the sandbag cover!
            targetX = player.x + 30;
            targetY = player.y - 5;
            incomingBulletTracers.push({
              id: uniqueId('tracer_e_cover'),
              from: 'enemy',
              startX: enemyMuzzleX,
              startY: enemyMuzzleY,
              endX: targetX,
              endY: targetY,
              lifetime: 0.15,
              color: '#EF4444',
            });
            updatedFloatingTexts.push({
              id: uniqueId('cover_hit_txt'),
              x: player.x + 30,
              y: player.y - 20,
              text: 'BLOCKED!',
              color: '#38BDF8',
              lifetime: 0.6,
              maxLifetime: 0.6,
            });
          } else {
            // Player is standing and takes damage!
            playerDamageTaken += updated.attackDamage;
            incomingBulletTracers.push({
              id: uniqueId('tracer_e_hit'),
              from: 'enemy',
              startX: enemyMuzzleX,
              startY: enemyMuzzleY,
              endX: targetX,
              endY: targetY,
              lifetime: 0.18,
              color: '#DC2626',
            });
            updatedFloatingTexts.push({
              id: uniqueId('p_damage_txt'),
              x: player.x,
              y: player.y - 60,
              text: `-${updated.attackDamage} HP`,
              color: '#EF4444',
              lifetime: 0.9,
              maxLifetime: 0.9,
            });
          }
        }
        break;

      case 'shooting':
        if (updated.stateTimer <= 0) {
          updated.state = 'hiding';
          updated.stateTimer = 1.2 + Math.random() * 1.5;
        }
        break;
    }

    updatedEnemies.push(updated);
  }

  // 5. Apply Player Damage
  if (playerDamageTaken > 0) {
    player.health = Math.max(0, player.health - playerDamageTaken);
    if (player.health <= 0) {
      status = 'game_over';
    }
  }

  // 6. Check Wave Completion
  const aliveEnemies = updatedEnemies.filter((e) => e.state !== 'dead');

  if (status === 'playing' && aliveEnemies.length === 0) {
    status = 'wave_cleared';
    waveTransitionTimer = 2.2;
    score += wave * 500;
    highScore = Math.max(highScore, score);

    updatedFloatingTexts.push({
      id: uniqueId('wave_cleared_txt'),
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2 - 50,
      text: `WAVE ${wave} CLEARED! +${wave * 500}`,
      color: '#10B981',
      lifetime: 2.0,
      maxLifetime: 2.0,
    });
  }

  // 7. Transition to Next Wave
  if (status === 'wave_cleared') {
    waveTransitionTimer -= dt;
    if (waveTransitionTimer <= 0) {
      wave += 1;
      status = 'playing';
      // Restock partial ammo and health as wave reward
      player.ammo = player.maxAmmo;
      player.health = Math.min(player.maxHealth, player.health + 25);
      return {
        ...state,
        status,
        wave,
        score,
        highScore,
        player,
        enemies: spawnWaveEnemies(wave),
        tracers: [...updatedTracers, ...incomingBulletTracers],
        floatingTexts: updatedFloatingTexts,
        combo,
        comboMultiplier,
        comboTimer,
      };
    }
  }

  return {
    ...state,
    status,
    wave,
    waveTransitionTimer,
    score,
    highScore,
    player,
    enemies: updatedEnemies,
    tracers: [...updatedTracers, ...incomingBulletTracers],
    floatingTexts: updatedFloatingTexts,
    combo,
    comboMultiplier,
    comboTimer,
  };
}
