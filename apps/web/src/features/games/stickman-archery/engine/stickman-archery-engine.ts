export interface ArcheryTarget {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  minY: number;
  maxY: number;
  bullseyeRadius: number;
  innerRadius: number;
  outerRadius: number;
}

export interface ArcheryArrow {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  isFlying: boolean;
  isStuck: boolean;
  stuckTargetId: number | null;
  offsetY: number;
}

export interface RoundConfig {
  round: number;
  name: string;
  arrows: number;
  wind: number; // Negative = leftward, Positive = rightward
  targets: ArcheryTarget[];
}

export interface StickmanArcheryState {
  status: 'aiming' | 'flying' | 'hit' | 'miss' | 'round-cleared' | 'game-over' | 'victory';
  roundIndex: number;
  score: number;
  highScore: number;
  arrowsLeft: number;
  maxArrows: number;
  combo: number;
  wind: number;
  bow: {
    x: number;
    y: number;
  };
  dragStart: { x: number; y: number } | null;
  currentDrag: { x: number; y: number } | null;
  arrow: ArcheryArrow;
  targets: ArcheryTarget[];
  lastHitPoints: number | null;
  lastHitText: string | null;
}

const GRAVITY = 520;
const MAX_PULL = 130;
const POWER_MULTIPLIER = 7.5;
const GROUND_Y = 380;

export const ARCHERY_ROUNDS: RoundConfig[] = [
  {
    round: 1,
    name: 'Still Breeze Target',
    arrows: 5,
    wind: 0,
    targets: [
      {
        id: 1,
        x: 620,
        y: 260,
        width: 22,
        height: 80,
        vy: 0,
        minY: 260,
        maxY: 260,
        bullseyeRadius: 10,
        innerRadius: 24,
        outerRadius: 40,
      },
    ],
  },
  {
    round: 2,
    name: 'Crosswind Range',
    arrows: 5,
    wind: 2.5,
    targets: [
      {
        id: 1,
        x: 740,
        y: 250,
        width: 22,
        height: 80,
        vy: 0,
        minY: 250,
        maxY: 250,
        bullseyeRadius: 10,
        innerRadius: 24,
        outerRadius: 40,
      },
    ],
  },
  {
    round: 3,
    name: 'Oscillating Beacon',
    arrows: 5,
    wind: -2.0,
    targets: [
      {
        id: 1,
        x: 760,
        y: 220,
        width: 22,
        height: 80,
        vy: 65,
        minY: 150,
        maxY: 320,
        bullseyeRadius: 10,
        innerRadius: 24,
        outerRadius: 40,
      },
    ],
  },
  {
    round: 4,
    name: 'Gale Distance',
    arrows: 5,
    wind: -4.5,
    targets: [
      {
        id: 1,
        x: 840,
        y: 200,
        width: 20,
        height: 74,
        vy: 85,
        minY: 140,
        maxY: 320,
        bullseyeRadius: 9,
        innerRadius: 22,
        outerRadius: 37,
      },
    ],
  },
  {
    round: 5,
    name: 'The Master Spire',
    arrows: 6,
    wind: 5.0,
    targets: [
      {
        id: 1,
        x: 880,
        y: 190,
        width: 20,
        height: 70,
        vy: 110,
        minY: 130,
        maxY: 330,
        bullseyeRadius: 8,
        innerRadius: 20,
        outerRadius: 35,
      },
    ],
  },
];

export function createInitialArcheryState(highScore = 0, roundIndex = 0): StickmanArcheryState {
  const safeIndex = Math.min(Math.max(0, roundIndex), ARCHERY_ROUNDS.length - 1);
  const roundDef = ARCHERY_ROUNDS[safeIndex];

  return {
    status: 'aiming',
    roundIndex: safeIndex,
    score: 0,
    highScore,
    arrowsLeft: roundDef.arrows,
    maxArrows: roundDef.arrows,
    combo: 0,
    wind: roundDef.wind,
    bow: { x: 120, y: 300 },
    dragStart: null,
    currentDrag: null,
    arrow: {
      x: 120,
      y: 300,
      vx: 0,
      vy: 0,
      angle: 0,
      isFlying: false,
      isStuck: false,
      stuckTargetId: null,
      offsetY: 0,
    },
    targets: roundDef.targets.map((t) => ({ ...t })),
    lastHitPoints: null,
    lastHitText: null,
  };
}

export function startAiming(
  state: StickmanArcheryState,
  screenX: number,
  screenY: number,
): StickmanArcheryState {
  if (state.status !== 'aiming' || state.arrowsLeft <= 0) return state;

  return {
    ...state,
    dragStart: { x: screenX, y: screenY },
    currentDrag: { x: screenX, y: screenY },
  };
}

export function updateAiming(
  state: StickmanArcheryState,
  screenX: number,
  screenY: number,
): StickmanArcheryState {
  if (!state.dragStart) return state;

  return {
    ...state,
    currentDrag: { x: screenX, y: screenY },
  };
}

export function releaseBow(state: StickmanArcheryState): StickmanArcheryState {
  if (!state.dragStart || !state.currentDrag || state.status !== 'aiming') {
    return { ...state, dragStart: null, currentDrag: null };
  }

  const dx = state.dragStart.x - state.currentDrag.x;
  const dy = state.dragStart.y - state.currentDrag.y;
  const rawDist = Math.hypot(dx, dy);

  if (rawDist < 12) {
    return { ...state, dragStart: null, currentDrag: null };
  }

  const pullDist = Math.min(MAX_PULL, rawDist);
  const angle = Math.atan2(dy, dx);
  const speed = pullDist * POWER_MULTIPLIER;

  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  return {
    ...state,
    status: 'flying',
    dragStart: null,
    currentDrag: null,
    arrowsLeft: state.arrowsLeft - 1,
    arrow: {
      x: state.bow.x,
      y: state.bow.y,
      vx,
      vy,
      angle,
      isFlying: true,
      isStuck: false,
      stuckTargetId: null,
      offsetY: 0,
    },
  };
}

export function calculateTrajectoryPreview(
  bow: { x: number; y: number },
  dragStart: { x: number; y: number } | null,
  currentDrag: { x: number; y: number } | null,
  wind: number,
  pointsCount = 14,
): Array<{ x: number; y: number }> {
  if (!dragStart || !currentDrag) return [];

  const dx = dragStart.x - currentDrag.x;
  const dy = dragStart.y - currentDrag.y;
  const rawDist = Math.hypot(dx, dy);
  if (rawDist < 12) return [];

  const pullDist = Math.min(MAX_PULL, rawDist);
  const angle = Math.atan2(dy, dx);
  const speed = pullDist * POWER_MULTIPLIER;

  let x = bow.x;
  let y = bow.y;
  let vx = Math.cos(angle) * speed;
  let vy = Math.sin(angle) * speed;
  const dt = 0.045;

  const points: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < pointsCount; i++) {
    vx += wind * 18 * dt;
    vy += GRAVITY * dt;
    x += vx * dt;
    y += vy * dt;
    if (y > GROUND_Y) break;
    points.push({ x, y });
  }

  return points;
}

export function stepArcheryGame(state: StickmanArcheryState, dt: number): StickmanArcheryState {
  // Move targets
  const updatedTargets = state.targets.map((t) => {
    if (t.vy === 0) return t;
    let nextY = t.y + t.vy * dt;
    let nextVy = t.vy;
    if (nextY > t.maxY) {
      nextY = t.maxY;
      nextVy = -Math.abs(t.vy);
    } else if (nextY < t.minY) {
      nextY = t.minY;
      nextVy = Math.abs(t.vy);
    }
    return { ...t, y: nextY, vy: nextVy };
  });

  if (state.status !== 'flying') {
    return { ...state, targets: updatedTargets };
  }

  const { arrow } = state;
  const nextVx = arrow.vx + state.wind * 18 * dt;
  const nextVy = arrow.vy + GRAVITY * dt;
  const nextX = arrow.x + nextVx * dt;
  const nextY = arrow.y + nextVy * dt;
  const nextAngle = Math.atan2(nextVy, nextVx);

  // Check collision with targets
  for (const target of updatedTargets) {
    const targetCenterY = target.y + target.height / 2;
    const targetLeft = target.x - target.width / 2;
    const targetRight = target.x + target.width / 2;

    if (
      nextX >= targetLeft &&
      nextX <= targetRight + 8 &&
      nextY >= target.y &&
      nextY <= target.y + target.height
    ) {
      const distFromCenter = Math.abs(nextY - targetCenterY);
      let hitScore = 10;
      let hitText = 'OUTER HIT (+10)';
      let isBullseye = false;

      if (distFromCenter <= target.bullseyeRadius) {
        hitScore = 50;
        hitText = 'BULLSEYE (+50)';
        isBullseye = true;
      } else if (distFromCenter <= target.innerRadius) {
        hitScore = 25;
        hitText = 'INNER RING (+25)';
      }

      const nextCombo = isBullseye ? state.combo + 1 : 0;
      const comboBonus = nextCombo > 1 ? (nextCombo - 1) * 20 : 0;
      const totalGain = hitScore + comboBonus;
      const newScore = state.score + totalGain;

      const isRoundCleared = state.arrowsLeft <= 0 || newScore >= 120 * (state.roundIndex + 1);

      return {
        ...state,
        status: isRoundCleared ? 'round-cleared' : 'hit',
        score: newScore,
        highScore: Math.max(state.highScore, newScore),
        combo: nextCombo,
        lastHitPoints: totalGain,
        lastHitText: comboBonus > 0 ? `${hitText} +${comboBonus} COMBO!` : hitText,
        targets: updatedTargets,
        arrow: {
          ...arrow,
          x: nextX,
          y: nextY,
          vx: 0,
          vy: 0,
          angle: nextAngle,
          isFlying: false,
          isStuck: true,
          stuckTargetId: target.id,
          offsetY: nextY - target.y,
        },
      };
    }
  }

  // Hit ground or out of bounds
  if (nextY >= GROUND_Y || nextX > 1050) {
    const isGameOver = state.arrowsLeft <= 0;
    return {
      ...state,
      status: isGameOver ? 'game-over' : 'miss',
      targets: updatedTargets,
      lastHitPoints: 0,
      lastHitText: 'MISSED TARGET',
      combo: 0,
      arrow: {
        ...arrow,
        x: nextX,
        y: Math.min(GROUND_Y, nextY),
        vx: 0,
        vy: 0,
        angle: nextAngle,
        isFlying: false,
        isStuck: true,
        stuckTargetId: null,
        offsetY: 0,
      },
    };
  }

  return {
    ...state,
    targets: updatedTargets,
    arrow: {
      ...arrow,
      x: nextX,
      y: nextY,
      vx: nextVx,
      vy: nextVy,
      angle: nextAngle,
    },
  };
}

export function resetForNextShot(state: StickmanArcheryState): StickmanArcheryState {
  if (state.arrowsLeft <= 0) {
    return { ...state, status: 'game-over' };
  }

  return {
    ...state,
    status: 'aiming',
    arrow: {
      x: state.bow.x,
      y: state.bow.y,
      vx: 0,
      vy: 0,
      angle: 0,
      isFlying: false,
      isStuck: false,
      stuckTargetId: null,
      offsetY: 0,
    },
    lastHitPoints: null,
    lastHitText: null,
  };
}

export function advanceToNextRound(state: StickmanArcheryState): StickmanArcheryState {
  const nextIndex = state.roundIndex + 1;
  if (nextIndex >= ARCHERY_ROUNDS.length) {
    return { ...state, status: 'victory' };
  }

  const nextRound = ARCHERY_ROUNDS[nextIndex];
  return {
    ...state,
    status: 'aiming',
    roundIndex: nextIndex,
    wind: nextRound.wind,
    arrowsLeft: nextRound.arrows,
    maxArrows: nextRound.arrows,
    targets: nextRound.targets.map((t) => ({ ...t })),
    arrow: {
      x: state.bow.x,
      y: state.bow.y,
      vx: 0,
      vy: 0,
      angle: 0,
      isFlying: false,
      isStuck: false,
      stuckTargetId: null,
      offsetY: 0,
    },
    lastHitPoints: null,
    lastHitText: null,
  };
}
