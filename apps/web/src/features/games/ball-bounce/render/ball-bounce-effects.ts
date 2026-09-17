import type { BallBounceEvent } from '../types/ball-bounce.types';
import { POWER_UP_STYLE, PALETTE, blockColor } from './ball-bounce-palette';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface Popup {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const MAX_PARTICLES = 260;
const PARTICLE_GRAVITY = 820;
const POPUP_LIFE = 0.8;
const SHAKE_DECAY = 9;
const MAX_SHAKE = 7;

/**
 * Purely cosmetic state (particles, popups, shake, flashes). Kept out of the game state so the
 * simulation stays deterministic and testable.
 */
export class BallBounceEffects {
  particles: Particle[] = [];
  popups: Popup[] = [];
  shake = 0;
  shakeX = 0;
  shakeY = 0;
  paddlePulse = 0;
  dangerFlash = 0;
  reducedMotion = false;

  reset(): void {
    this.particles = [];
    this.popups = [];
    this.shake = 0;
    this.paddlePulse = 0;
    this.dangerFlash = 0;
  }

  private addShake(amount: number): void {
    if (this.reducedMotion) return;
    this.shake = Math.min(MAX_SHAKE, this.shake + amount);
  }

  private burst(x: number, y: number, color: string, count: number, speed: number): void {
    const n = this.reducedMotion ? Math.ceil(count / 3) : count;
    for (let i = 0; i < n; i++) {
      if (this.particles.length >= MAX_PARTICLES) this.particles.shift();
      const angle = Math.random() * Math.PI * 2;
      const v = speed * (0.35 + Math.random() * 0.65);
      const life = 0.35 + Math.random() * 0.35;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v - speed * 0.25,
        life,
        maxLife: life,
        size: 2 + Math.random() * 3,
        color,
      });
    }
  }

  private popup(x: number, y: number, text: string, color: string = PALETTE.text): void {
    this.popups.push({ x, y, text, color, life: POPUP_LIFE });
  }

  consume(events: BallBounceEvent[]): void {
    for (const e of events) {
      switch (e.type) {
        case 'paddle':
          this.paddlePulse = 1;
          this.burst(e.x, e.y, PALETTE.paddle, 4, 120);
          break;
        case 'block-hit':
          this.burst(e.x, e.y, blockColor(e.hp + 1), 5, 140);
          break;
        case 'block-break':
          this.burst(e.x, e.y, blockColor(e.maxHp), 14, 260);
          this.popup(e.x, e.y, `+${e.points}`);
          if (e.maxHp >= 3) this.addShake(2.5);
          break;
        case 'power-up': {
          const style = POWER_UP_STYLE[e.kind];
          this.burst(e.x, e.y, style.color, 16, 220);
          this.popup(e.x, e.y - 18, style.label, style.color);
          this.addShake(1.5);
          break;
        }
        case 'life-lost':
          this.dangerFlash = 1;
          this.addShake(6);
          break;
        case 'level-clear':
          this.addShake(4);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += PARTICLE_GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);

    for (const pop of this.popups) {
      pop.life -= dt;
      pop.y -= 42 * dt;
    }
    this.popups = this.popups.filter((p) => p.life > 0);

    this.shake *= Math.exp(-SHAKE_DECAY * dt);
    if (this.shake < 0.05) this.shake = 0;
    this.shakeX = (Math.random() * 2 - 1) * this.shake;
    this.shakeY = (Math.random() * 2 - 1) * this.shake;
    this.paddlePulse = Math.max(0, this.paddlePulse - dt * 6);
    this.dangerFlash = Math.max(0, this.dangerFlash - dt * 2.2);
  }
}

export const POPUP_MAX_LIFE = POPUP_LIFE;
