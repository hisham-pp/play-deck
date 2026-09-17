import { POWER_UP_SIZE, WORLD_HEIGHT } from '../engine/ball-bounce-constants';
import type { BallBounceState, BlockState } from '../types/ball-bounce.types';
import { BallBounceEffects, POPUP_MAX_LIFE } from './ball-bounce-effects';
import { PALETTE, POWER_UP_STYLE, blockColor } from './ball-bounce-palette';

const GRID_SIZE = 40;
const FONT_STACK = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

export interface Viewport {
  /** CSS pixels per world unit. */
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** Fits the world into a CSS box, letterboxing whichever axis has spare room. */
export function fitViewport(cssW: number, cssH: number, worldW: number): Viewport {
  const scale = Math.max(0.01, Math.min(cssW / worldW, cssH / WORLD_HEIGHT));
  return {
    scale,
    offsetX: (cssW - worldW * scale) / 2,
    offsetY: (cssH - WORLD_HEIGHT * scale) / 2,
  };
}

/** Canvas 2D renderer. Knows nothing about React; draws one frame from state + effects. */
export class BallBounceRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private cssW = 0;
  private cssH = 0;
  private dpr = 1;
  viewport: Viewport = { scale: 1, offsetX: 0, offsetY: 0 };

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D context unavailable');
    this.ctx = ctx;
  }

  resize(cssW: number, cssH: number, dpr: number): void {
    this.cssW = cssW;
    this.cssH = cssH;
    this.dpr = Math.min(dpr, 2);
    this.canvas.width = Math.max(1, Math.round(cssW * this.dpr));
    this.canvas.height = Math.max(1, Math.round(cssH * this.dpr));
  }

  /** Converts a client-space x (e.g. from a pointer event) into world units. */
  toWorldX(localX: number): number {
    return (localX - this.viewport.offsetX) / this.viewport.scale;
  }

  draw(state: BallBounceState, fx: BallBounceEffects): void {
    const { ctx } = this;
    const worldW = state.world.width;
    this.viewport = fitViewport(this.cssW, this.cssH, worldW);
    const { scale, offsetX, offsetY } = this.viewport;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, this.cssW, this.cssH);

    const k = this.dpr * scale;
    ctx.setTransform(
      k,
      0,
      0,
      k,
      this.dpr * (offsetX + fx.shakeX),
      this.dpr * (offsetY + fx.shakeY),
    );

    this.drawBoard(worldW, state.powerUps.slowTimer > 0);
    for (const block of state.blocks) this.drawBlock(block);
    this.drawPowerUps(state);
    this.drawPaddle(state, fx);
    this.drawBalls(state);
    this.drawParticles(fx);
    this.drawPopups(fx);

    if (fx.dangerFlash > 0) {
      ctx.fillStyle = `rgba(244, 63, 94, ${0.16 * fx.dangerFlash})`;
      ctx.fillRect(0, WORLD_HEIGHT - 140, worldW, 140);
    }
  }

  private drawBoard(worldW: number, slow: boolean): void {
    const { ctx } = this;
    ctx.fillStyle = PALETTE.board;
    ctx.fillRect(0, 0, worldW, WORLD_HEIGHT);

    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = GRID_SIZE; x < worldW; x += GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, WORLD_HEIGHT);
    }
    for (let y = GRID_SIZE; y < WORLD_HEIGHT; y += GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(worldW, y);
    }
    ctx.stroke();

    if (slow) {
      ctx.fillStyle = PALETTE.slowTint;
      ctx.fillRect(0, 0, worldW, WORLD_HEIGHT);
    }

    ctx.strokeStyle = PALETTE.boardEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, worldW - 2, WORLD_HEIGHT - 2);
  }

  private drawBlock(b: BlockState): void {
    const { ctx } = this;
    const color = blockColor(b.hp);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.w, b.h, 4);
    ctx.fill();

    // Top light edge and bottom shade give depth without gradients.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(b.x + 3, b.y + 2, b.w - 6, 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(b.x + 2, b.y + b.h - 4, b.w - 4, 3);

    // Durability pips.
    if (b.hp > 1) {
      ctx.fillStyle = 'rgba(5, 7, 13, 0.55)';
      const pip = 4;
      const gap = 4;
      const total = b.hp * pip + (b.hp - 1) * gap;
      let px = b.x + (b.w - total) / 2;
      for (let i = 0; i < b.hp; i++, px += pip + gap) {
        ctx.fillRect(px, b.y + b.h / 2 - pip / 2, pip, pip);
      }
    }

    // Cracks once a tough block has been damaged.
    if (b.hp < b.maxHp) {
      ctx.strokeStyle = 'rgba(5, 7, 13, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x + b.w * 0.18, b.y + 3);
      ctx.lineTo(b.x + b.w * 0.3, b.y + b.h * 0.55);
      ctx.lineTo(b.x + b.w * 0.24, b.y + b.h - 3);
      ctx.moveTo(b.x + b.w * 0.3, b.y + b.h * 0.55);
      ctx.lineTo(b.x + b.w * 0.42, b.y + b.h * 0.7);
      ctx.stroke();
    }

    if (b.flash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * b.flash})`;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 4);
      ctx.fill();
    }
  }

  private drawPaddle(state: BallBounceState, fx: BallBounceEffects): void {
    const { ctx } = this;
    const p = state.player.paddle;
    const squash = fx.paddlePulse * 2.5;
    const w = p.width + squash * 2;
    const h = p.height - squash * 0.6;
    const x = p.x - w / 2;
    const y = p.y + squash * 0.6;
    const wide = state.powerUps.wideTimer > 0;

    ctx.fillStyle = wide ? PALETTE.paddleWide : PALETTE.paddle;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, h / 2);
    ctx.fill();

    ctx.fillStyle = wide ? 'rgba(5, 7, 13, 0.35)' : PALETTE.paddleAccent;
    ctx.fillRect(p.x - 12, y + h / 2 - 1.5, 24, 3);

    // Expiring power-up blinks during its final two seconds.
    const t = state.powerUps.wideTimer;
    if (wide && t < 2 && Math.floor(t * 8) % 2 === 0) {
      ctx.fillStyle = 'rgba(5, 7, 13, 0.35)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, h / 2);
      ctx.fill();
    }
  }

  private drawBalls(state: BallBounceState): void {
    const { ctx } = this;
    for (const ball of state.balls) {
      const n = ball.trail.length;
      for (let i = n - 1; i >= 1; i--) {
        const t = 1 - i / n;
        ctx.fillStyle = `rgba(248, 250, 252, ${0.22 * t})`;
        ctx.beginPath();
        ctx.arc(ball.trail[i].x, ball.trail[i].y, ball.radius * (0.45 + 0.5 * t), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = PALETTE.ball;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawPowerUps(state: BallBounceState): void {
    const { ctx } = this;
    const { w, h } = POWER_UP_SIZE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 13px ${FONT_STACK}`;
    for (const item of state.powerUps.items) {
      const style = POWER_UP_STYLE[item.kind];
      ctx.fillStyle = style.color;
      ctx.beginPath();
      ctx.roundRect(item.x - w / 2, item.y - h / 2, w, h, h / 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.backdrop;
      ctx.fillText(style.glyph, item.x, item.y + 1);
    }
  }

  private drawParticles(fx: BallBounceEffects): void {
    const { ctx } = this;
    for (const p of fx.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  private drawPopups(fx: BallBounceEffects): void {
    const { ctx } = this;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 15px ${FONT_STACK}`;
    for (const pop of fx.popups) {
      ctx.globalAlpha = Math.min(1, (pop.life / POPUP_MAX_LIFE) * 1.6);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
    }
    ctx.globalAlpha = 1;
  }
}
