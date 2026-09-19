import { breathPhase, limbSegment } from '../engine/giant-ai';
import { MOOD_ASLEEP, MOOD_AWAKE, MOOD_RESTLESS } from '../engine/giant-constants';
import type { GiantMood, GiantWorld } from '../types/giant.types';
import { pulse, withAlpha, type RenderOptions } from './render-types';

/** The giant's skin warms as he surfaces — the room's clearest tell. */
const MOOD_SKIN: Record<GiantMood, string> = {
  asleep: '#1e293b',
  stirring: '#3b3054',
  restless: '#4c2a3c',
  awake: '#7f1d1d',
};

const MOOD_EDGE: Record<GiantMood, string> = {
  asleep: '#334155',
  stirring: '#7c5cbf',
  restless: '#e11d48',
  awake: '#fca5a5',
};

/** A sweeping arm is a hazard, so it is drawn with a warning wash behind it. */
function drawLimbs(ctx: CanvasRenderingContext2D, world: GiantWorld, options: RenderOptions): void {
  const dangerous = world.mood === MOOD_RESTLESS || world.mood === MOOD_AWAKE;

  for (const limb of world.giant.limbs) {
    const { a, b } = limbSegment(limb);

    if (dangerous) {
      ctx.save();
      ctx.strokeStyle = withAlpha(
        '#f43f5e',
        0.18 + pulse(world.elapsedMs + limb.length, 620, options) * 0.22,
      );
      ctx.lineWidth = (limb.radius + 16) * 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.strokeStyle = MOOD_SKIN[world.mood];
    ctx.lineWidth = limb.radius * 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    ctx.strokeStyle = MOOD_EDGE[world.mood];
    ctx.lineWidth = options.highContrast ? 3 : 2;
    ctx.stroke();
    ctx.restore();

    // A fist, so the far end of the arm reads as the end of the arm.
    ctx.beginPath();
    ctx.arc(b.x, b.y, limb.radius + 5, 0, Math.PI * 2);
    ctx.fillStyle = MOOD_SKIN[world.mood];
    ctx.fill();
    ctx.strokeStyle = MOOD_EDGE[world.mood];
    ctx.lineWidth = options.highContrast ? 3 : 2;
    ctx.stroke();
  }
}

function drawFace(ctx: CanvasRenderingContext2D, world: GiantWorld): void {
  const { pos, radius } = world.giant.head;
  const awake = world.mood === MOOD_AWAKE;
  const eyeY = pos.y - radius * 0.18;

  ctx.save();
  ctx.strokeStyle = awake ? '#fef08a' : MOOD_EDGE[world.mood];
  ctx.lineWidth = awake ? 5 : 3;
  ctx.lineCap = 'round';

  for (const side of [-1, 1]) {
    const eyeX = pos.x + side * radius * 0.36;
    ctx.beginPath();
    if (awake) {
      // Open eyes: the last thing the crew ever sees.
      ctx.arc(eyeX, eyeY, radius * 0.17, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    } else {
      ctx.moveTo(eyeX - radius * 0.2, eyeY);
      ctx.lineTo(eyeX + radius * 0.2, eyeY);
    }
    ctx.stroke();
  }

  if (world.mood !== MOOD_ASLEEP) {
    // A furrowed brow the moment he starts to surface.
    ctx.beginPath();
    ctx.moveTo(pos.x - radius * 0.44, eyeY - radius * 0.34);
    ctx.lineTo(pos.x - radius * 0.14, eyeY - radius * 0.18);
    ctx.moveTo(pos.x + radius * 0.44, eyeY - radius * 0.34);
    ctx.lineTo(pos.x + radius * 0.14, eyeY - radius * 0.18);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The sleeping body. The chest swells on the breath curve, which is the only
 * motion on screen while the room is quiet — and the thing that starts twitching
 * when it is not.
 */
export function drawGiant(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  const { torso, head } = world.giant;
  const breath = options.reducedMotion ? 0.5 : breathPhase(world.giant, world.mood);
  const swell = 1 + breath * (world.mood === MOOD_ASLEEP ? 0.02 : 0.045);

  drawLimbs(ctx, world, options);

  ctx.save();
  ctx.translate(torso.x + torso.w / 2, torso.y + torso.h / 2);
  ctx.scale(swell, swell);
  ctx.beginPath();
  ctx.roundRect(-torso.w / 2, -torso.h / 2, torso.w, torso.h, 34);
  ctx.fillStyle = MOOD_SKIN[world.mood];
  ctx.fill();
  ctx.strokeStyle = MOOD_EDGE[world.mood];
  ctx.lineWidth = options.highContrast ? 4 : 2.5;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(head.pos.x, head.pos.y, head.radius, 0, Math.PI * 2);
  ctx.fillStyle = MOOD_SKIN[world.mood];
  ctx.fill();
  ctx.strokeStyle = MOOD_EDGE[world.mood];
  ctx.lineWidth = options.highContrast ? 4 : 2.5;
  ctx.stroke();

  drawFace(ctx, world);
}

/** The red wash that floods the room the instant he opens his eyes. */
export function drawWakeFlash(ctx: CanvasRenderingContext2D, world: GiantWorld): void {
  if (world.mood !== MOOD_AWAKE) return;
  const { width, height } = world.map;
  ctx.fillStyle = 'rgba(127, 29, 29, 0.42)';
  ctx.fillRect(0, 0, width, height);
}
