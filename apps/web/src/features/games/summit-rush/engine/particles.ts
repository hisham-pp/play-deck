import { MAX_PARTICLES } from './summit-constants';
import type { Particle, Vec2, World } from './summit-types';

const MAX_POPUPS = 4;
const POPUP_LIFE = 1.6;

function pushParticle(world: World, particle: Particle): void {
  if (world.particles.length >= MAX_PARTICLES) world.particles.shift();
  world.particles.push(particle);
}

export function spawnBurst(
  world: World,
  at: Vec2,
  color: string,
  count: number,
  speed: number,
  gravity = 6,
): void {
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
    const v = speed * (0.5 + Math.random() * 0.7);
    const life = 0.45 + Math.random() * 0.4;
    pushParticle(world, {
      pos: { x: at.x, y: at.y },
      vel: { x: Math.cos(angle) * v, y: Math.sin(angle) * v },
      life,
      maxLife: life,
      size: 0.08 + Math.random() * 0.1,
      color,
      gravity,
    });
  }
}

/** Dust kicked back from a wheel contact. `intensity` is 0..1. */
export function spawnDust(
  world: World,
  at: Vec2,
  direction: number,
  intensity: number,
  color: string,
): void {
  if (Math.random() > intensity * 0.9) return;
  const life = 0.5 + Math.random() * 0.5;
  pushParticle(world, {
    pos: { x: at.x, y: at.y + 0.05 },
    vel: {
      x: -direction * (1.5 + Math.random() * 3.5 * intensity),
      y: 0.8 + Math.random() * 2.2 * intensity,
    },
    life,
    maxLife: life,
    size: 0.14 + Math.random() * 0.22 * (0.5 + intensity),
    color,
    gravity: -0.6,
  });
}

export function spawnLandingPuff(world: World, at: Vec2, impact: number, color: string): void {
  const count = Math.min(18, Math.round(impact * 2));
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const life = 0.5 + Math.random() * 0.5;
    pushParticle(world, {
      pos: { x: at.x, y: at.y + 0.1 },
      vel: { x: side * (1 + Math.random() * 4), y: Math.random() * 1.8 },
      life,
      maxLife: life,
      size: 0.18 + Math.random() * 0.25,
      color,
      gravity: -0.4,
    });
  }
}

export function updateParticles(world: World, dt: number): void {
  const list = world.particles;
  let write = 0;
  for (let i = 0; i < list.length; i++) {
    const p = list[i];
    p.life -= dt;
    if (p.life <= 0) continue;
    p.vel.y -= p.gravity * dt;
    p.vel.x *= 1 - 1.5 * dt;
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    list[write++] = p;
  }
  list.length = write;
}

export function addPopup(world: World, text: string, color: string): void {
  world.popups.push({ text, color, life: POPUP_LIFE });
  if (world.popups.length > MAX_POPUPS) world.popups.shift();
}

export function updatePopups(world: World, dt: number): void {
  for (const popup of world.popups) popup.life -= dt;
  world.popups = world.popups.filter((p) => p.life > 0);
}

export { POPUP_LIFE };
