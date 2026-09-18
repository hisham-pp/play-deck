import { stepObjectPhysics } from './conveyor-physics';
import type {
  ConveyorEvent,
  ConveyorGameState,
  ConveyorGlyph,
  ConveyorSegment,
  MachineConfig,
  MachineObject,
  ObjectType,
} from './conveyor-types';

export const CONVEYOR_GLYPHS: ConveyorGlyph[] = ['●', '◆', '★', '▲', '■', '✦'];
export const CONVEYOR_COLORS = [
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
];

export const MAX_TILT_RAD = Math.PI / 5; // ~36 deg
export const MAX_ELEVATION_PX = 50;
export const MAX_BELT_SPEED = 140;

let nextObjSeq = 1;

export function createMachineObject(
  type: ObjectType,
  x: number,
  y: number,
  vx: number,
  vy: number,
): MachineObject {
  const id = `obj-${nextObjSeq++}-${Date.now()}`;
  const base = {
    id,
    type,
    x,
    y,
    vx,
    vy,
    rotation: 0,
    vRot: 0,
    status: 'active' as const,
    spawnTime: Date.now(),
    timer: 0,
    maxTimer: 0,
  };

  switch (type) {
    case 'bouncy':
      return {
        ...base,
        shape: 'circle',
        radius: 14,
        width: 28,
        height: 28,
        mass: 0.6,
        restitution: 0.85,
        friction: 0.12,
        durability: 350,
        scoreValue: 150,
      };
    case 'fragile':
      return {
        ...base,
        shape: 'box',
        radius: 13,
        width: 26,
        height: 26,
        mass: 0.5,
        restitution: 0.18,
        friction: 0.28,
        durability: 140, // Shatters on hard impact
        scoreValue: 250,
      };
    case 'heavy':
      return {
        ...base,
        shape: 'box',
        radius: 18,
        width: 36,
        height: 36,
        mass: 3.2,
        restitution: 0.08,
        friction: 0.45,
        durability: 500,
        scoreValue: 200,
      };
    case 'explosive':
      return {
        ...base,
        shape: 'circle',
        radius: 15,
        width: 30,
        height: 30,
        mass: 1.1,
        restitution: 0.22,
        friction: 0.32,
        durability: 180,
        timer: 15.0,
        maxTimer: 15.0,
        scoreValue: 300,
      };
    case 'standard':
    default:
      return {
        ...base,
        shape: 'circle',
        radius: 15,
        width: 30,
        height: 30,
        mass: 1.0,
        restitution: 0.35,
        friction: 0.25,
        durability: 300,
        scoreValue: 100,
      };
  }
}

export function createInitialConveyorState(
  layout: MachineConfig,
  playerRoster: Array<{ id: string; name: string; isBot?: boolean }> = [],
): ConveyorGameState {
  const segments: ConveyorSegment[] = layout.defaultPlatforms.map((plat, idx) => {
    const player = playerRoster[idx];
    return {
      id: `seg-${idx + 1}`,
      seatIndex: idx,
      label: player ? player.name : `Segment ${idx + 1}`,
      x: plat.x,
      y: plat.y,
      baseY: plat.y,
      length: plat.length,
      thickness: 16,
      angle: plat.angle ?? 0.08,
      targetAngle: plat.angle ?? 0.08,
      elevation: 0,
      targetElevation: 0,
      speed: 40,
      targetSpeed: 40,
      color: CONVEYOR_COLORS[idx % CONVEYOR_COLORS.length],
      glyph: CONVEYOR_GLYPHS[idx % CONVEYOR_GLYPHS.length],
      assignedPlayerId: player ? player.id : null,
      assignedPlayerName: player ? player.name : null,
      isBot: player ? !!player.isBot : true,
    };
  });

  return {
    phase: 'ready',
    layout,
    segments,
    objects: [],
    score: 0,
    comboStreak: 0,
    deliveredCount: 0,
    brokenCount: 0,
    droppedCount: 0,
    timeRemaining: layout.timeLimit,
    spawnCooldown: 1.5,
    events: [],
    lastEvent: null,
  };
}

export function updateSegmentControl(
  state: ConveyorGameState,
  seatIndex: number,
  controls: { angleDelta?: number; elevationDelta?: number; speedDelta?: number },
): ConveyorGameState {
  const seg = state.segments[seatIndex];
  if (!seg) return state;

  const newAngle = Math.max(
    -MAX_TILT_RAD,
    Math.min(MAX_TILT_RAD, seg.targetAngle + (controls.angleDelta ?? 0)),
  );
  const newElevation = Math.max(
    -MAX_ELEVATION_PX,
    Math.min(MAX_ELEVATION_PX, seg.targetElevation + (controls.elevationDelta ?? 0)),
  );
  const newSpeed = Math.max(
    -MAX_BELT_SPEED,
    Math.min(MAX_BELT_SPEED, seg.targetSpeed + (controls.speedDelta ?? 0)),
  );

  const updatedSegments = state.segments.map((s, idx) =>
    idx === seatIndex
      ? {
          ...s,
          targetAngle: newAngle,
          targetElevation: newElevation,
          targetSpeed: newSpeed,
        }
      : s,
  );

  return { ...state, segments: updatedSegments };
}

export function spawnNextObject(state: ConveyorGameState): ConveyorGameState {
  const pool = state.layout.objectPool;
  const type = pool[Math.floor(Math.random() * pool.length)];
  const sp = state.layout.spawnPoint;

  const newObj = createMachineObject(type, sp.x, sp.y, sp.vx, sp.vy);
  return {
    ...state,
    objects: [...state.objects, newObj],
    spawnCooldown: state.layout.spawnPoint.interval,
  };
}

/**
 * AI Bot assistant: monitors objects approaching its segment and tilts/speeds up to catch and forward them.
 */
function updateBotSegment(seg: ConveyorSegment, objects: MachineObject[], dt: number): void {
  const upcoming = objects.find(
    (o) => o.status === 'active' && o.x < seg.x + seg.length && o.x > seg.x - seg.length - 80,
  );

  if (upcoming) {
    // Forward tilt to pass to next segment
    const desiredAngle = upcoming.type === 'fragile' ? 0.06 : 0.12;
    seg.targetAngle += (desiredAngle - seg.targetAngle) * dt * 4;
    seg.targetSpeed += (70 - seg.targetSpeed) * dt * 3;
  } else {
    // Neutral holding position
    seg.targetAngle += (0.05 - seg.targetAngle) * dt * 2;
  }
}

function processCompletedObjects(state: ConveyorGameState): {
  delivered: MachineObject[];
  broken: MachineObject[];
  dropped: MachineObject[];
  remaining: MachineObject[];
} {
  const delivered: MachineObject[] = [];
  const broken: MachineObject[] = [];
  const dropped: MachineObject[] = [];
  const remaining: MachineObject[] = [];

  for (const obj of state.objects) {
    if (obj.status === 'delivered') delivered.push(obj);
    else if (obj.status === 'broken') broken.push(obj);
    else if (obj.status === 'dropped') dropped.push(obj);
    else remaining.push(obj);
  }

  return { delivered, broken, dropped, remaining };
}

export function tickConveyorGame(state: ConveyorGameState, dt: number): ConveyorGameState {
  if (state.phase !== 'running') return state;

  const timeRemaining = Math.max(0, state.timeRemaining - dt);
  const spawnCooldown = state.spawnCooldown - dt;

  // Smoothly interpolate platform positions & angles
  for (const seg of state.segments) {
    if (seg.isBot) {
      updateBotSegment(seg, state.objects, dt);
    }
    seg.angle += (seg.targetAngle - seg.angle) * Math.min(1, dt * 10);
    seg.elevation += (seg.targetElevation - seg.elevation) * Math.min(1, dt * 8);
    seg.speed += (seg.targetSpeed - seg.speed) * Math.min(1, dt * 6);
  }

  // Step physics for all active objects
  for (const obj of state.objects) {
    stepObjectPhysics(
      obj,
      state.segments,
      state.layout.obstacles,
      state.layout.targetZone,
      state.layout.hazardY,
      dt,
    );
  }

  const { delivered, broken, dropped, remaining } = processCompletedObjects(state);

  let newScore = state.score;
  let newStreak = state.comboStreak;
  let newDelivered = state.deliveredCount;
  let newBroken = state.brokenCount;
  let newDropped = state.droppedCount;
  let lastEvent: ConveyorEvent | null = state.lastEvent;

  // Handle deliveries
  for (const item of delivered) {
    newDelivered++;
    newStreak++;
    const bonus = Math.min(5, newStreak) * 25;
    const pts = item.scoreValue + bonus;
    newScore += pts;
    lastEvent = {
      id: `ev-${Date.now()}-${newDelivered}`,
      type: 'delivered',
      text: `Delivered ${item.type.toUpperCase()}! (+${pts})`,
      points: pts,
      timestamp: Date.now(),
    };
  }

  // Handle broken/dropped penalties
  for (const item of broken) {
    newBroken++;
    newStreak = 0;
    lastEvent = {
      id: `ev-brk-${Date.now()}`,
      type: 'broken',
      text: `${item.type.toUpperCase()} SHATTERED!`,
      points: 0,
      timestamp: Date.now(),
    };
  }

  for (const item of dropped) {
    newDropped++;
    newStreak = 0;
    lastEvent = {
      id: `ev-drp-${Date.now()}`,
      type: 'dropped',
      text: `${item.type.toUpperCase()} DROPPED!`,
      points: 0,
      timestamp: Date.now(),
    };
  }

  let nextPhase: ConveyorGameState['phase'] = state.phase;
  if (newDelivered >= state.layout.targetDeliveries) {
    nextPhase = 'wave_cleared';
  } else if (timeRemaining <= 0) {
    nextPhase = 'failed';
  }

  let nextState: ConveyorGameState = {
    ...state,
    phase: nextPhase,
    objects: remaining,
    score: newScore,
    comboStreak: newStreak,
    deliveredCount: newDelivered,
    brokenCount: newBroken,
    droppedCount: newDropped,
    timeRemaining,
    spawnCooldown,
    lastEvent,
    events: lastEvent ? [lastEvent, ...state.events.slice(0, 5)] : state.events,
  };

  // Spawn new object if timer elapsed and round still active
  if (spawnCooldown <= 0 && nextPhase === 'running') {
    nextState = spawnNextObject(nextState);
  }

  return nextState;
}
