import type {
  CourseDefinition,
  CourseElement,
  GravityDirection,
  GravityShiftPlayer,
} from '../types/gravity-shift.types';

export interface RenderState {
  course: CourseDefinition;
  players: GravityShiftPlayer[];
  localPlayerId: string | null;
  currentGravity: GravityDirection;
  cameraRotation: number; // In radians
  elapsedTimeMs: number;
}

export function getTargetRotationForGravity(dir: GravityDirection): number {
  switch (dir) {
    case 'down':
      return 0;
    case 'left':
      return -Math.PI / 2;
    case 'up':
      return Math.PI;
    case 'right':
      return Math.PI / 2;
  }
}

export function renderGravityShiftFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RenderState,
): void {
  const { course, players, localPlayerId, cameraRotation, elapsedTimeMs } = state;

  // Clear canvas
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  // Find camera target (local player or first player or spawn)
  const targetPlayer = players.find((p) => p.id === localPlayerId) || players[0];
  const targetX = targetPlayer
    ? targetPlayer.character.position.x + targetPlayer.character.width / 2
    : course.spawnPoint.x;
  const targetY = targetPlayer
    ? targetPlayer.character.position.y + targetPlayer.character.height / 2
    : course.spawnPoint.y;

  ctx.save();

  // Center camera on target player
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-cameraRotation);
  ctx.translate(-targetX, -targetY);

  // 1. Draw World Background Grid & Gravity Arrows
  drawBackgroundGrid(ctx, course, elapsedTimeMs);

  // 2. Draw Course Elements
  course.elements.forEach((element) => {
    drawCourseElement(ctx, element, elapsedTimeMs);
  });

  // 3. Draw Players
  players.forEach((player) => {
    drawPlayer(ctx, player, player.id === localPlayerId, elapsedTimeMs);
  });

  ctx.restore();
}

function drawBackgroundGrid(
  ctx: CanvasRenderingContext2D,
  course: CourseDefinition,
  timeMs: number,
): void {
  const { width, height } = course.worldBounds;
  const gridSize = 80;

  ctx.strokeStyle = 'rgba(35, 47, 69, 0.4)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  for (let x = 0; x <= width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Pulsing ambient border
  const glow = 0.5 + 0.5 * Math.sin(timeMs * 0.003);
  ctx.strokeStyle = `rgba(56, 189, 248, ${0.2 + 0.15 * glow})`;
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, width, height);
}

function drawCourseElement(ctx: CanvasRenderingContext2D, el: CourseElement, timeMs: number): void {
  switch (el.type) {
    case 'platform': {
      ctx.fillStyle = '#111827';
      ctx.fillRect(el.x, el.y, el.width, el.height);

      ctx.strokeStyle = '#232f45';
      ctx.lineWidth = 2;
      ctx.strokeRect(el.x, el.y, el.width, el.height);

      // Top edge neon highlight
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(el.x, el.y);
      ctx.lineTo(el.x + el.width, el.y);
      ctx.stroke();
      break;
    }

    case 'hazard': {
      // Pulsing laser hazard
      const pulse = 0.7 + 0.3 * Math.sin(timeMs * 0.008 + el.x);
      ctx.fillStyle = `rgba(239, 68, 68, ${0.3 * pulse})`;
      ctx.fillRect(el.x, el.y, el.width, el.height);

      ctx.strokeStyle = `rgba(248, 113, 113, ${pulse})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(el.x, el.y, el.width, el.height);

      // Core danger stripes
      ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
      ctx.fillRect(el.x + 2, el.y + el.height / 2 - 2, el.width - 4, 4);
      break;
    }

    case 'checkpoint': {
      const activePulse = 0.6 + 0.4 * Math.sin(timeMs * 0.005 + (el.order || 0));
      ctx.fillStyle = `rgba(16, 185, 129, ${0.15 * activePulse})`;
      ctx.fillRect(el.x, el.y, el.width, el.height);

      ctx.strokeStyle = `rgba(52, 211, 153, ${activePulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(el.x, el.y, el.width, el.height);
      ctx.setLineDash([]);

      // Checkpoint banner label
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`CP ${el.order ?? ''}`, el.x + el.width / 2, el.y - 8);
      break;
    }

    case 'bounce-pad': {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(el.x, el.y, el.width, el.height);

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.strokeRect(el.x, el.y, el.width, el.height);

      // Spring coil indicator
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(el.x + el.width / 2, el.y + el.height / 2, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'energy-core': {
      const floatY = Math.sin(timeMs * 0.006) * 6;
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2 + floatY;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(timeMs * 0.002);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-el.width / 3, -el.height / 3, (el.width * 2) / 3, (el.height * 2) / 3);

      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(-el.width / 3, -el.height / 3, (el.width * 2) / 3, (el.height * 2) / 3);
      ctx.restore();
      break;
    }

    case 'finish': {
      // Spinning victory vortex portal
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const radius = Math.min(el.width, el.height) / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(timeMs * 0.003);

      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FINISH', cx, cy - radius - 10);
      break;
    }
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: GravityShiftPlayer,
  isLocal: boolean,
  timeMs: number,
): void {
  const { character, color, name, avatar } = player;
  const { position, width, height, velocity, isDead } = character;

  if (isDead) {
    // Respawning ghost effect
    ctx.save();
    ctx.globalAlpha = 0.4 + 0.3 * Math.sin(timeMs * 0.02);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x + width / 2, position.y + height / 2, width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  const cx = position.x + width / 2;
  const cy = position.y + height / 2;
  const radius = width / 2;

  // Local player aura ring
  if (isLocal) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Body Capsule
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Face / Visor Direction based on velocity
  const speed = Math.hypot(velocity.x, velocity.y);
  const lookAngle = speed > 10 ? Math.atan2(velocity.y, velocity.x) : 0;
  const eyeOffset = 6;
  const eyeX = cx + Math.cos(lookAngle) * eyeOffset;
  const eyeY = cy + Math.sin(lookAngle) * eyeOffset;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Visor pupil
  ctx.fillStyle = '#090d16';
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
  ctx.fill();

  // Name and Avatar Tag
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${avatar} ${name}`, cx, position.y - 10);
}
