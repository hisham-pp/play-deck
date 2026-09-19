import { ARENA_HEIGHT, ARENA_WIDTH } from '../engine/gravity-physics';
import type {
  AsteroidHazard,
  BallState,
  CosmicCup,
  GravityObject,
  Vector2D,
  WallSegment,
} from '../types/gravity-golf.types';
import type { RenderOptions } from './render-types';

interface Star {
  x: number;
  y: number;
  r: number;
  brightness: number;
  phase: number;
}

export class GravityGolfRenderer {
  private stars: Star[] = [];

  constructor() {
    this.initStarfield();
  }

  private initStarfield() {
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * ARENA_WIDTH,
        y: Math.random() * ARENA_HEIGHT,
        r: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.7 + 0.3,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    ball: BallState,
    objects: GravityObject[],
    hazards: AsteroidHazard[],
    walls: WallSegment[],
    cup: CosmicCup,
    trajectoryPoints: Vector2D[],
    timeMs: number,
    options: RenderOptions,
    selectedPlacementPos?: Vector2D | null,
    selectedPlacementType?: string | null,
  ): void {
    ctx.save();

    // 1. Cosmic Background
    this.drawBackground(ctx, timeMs, options);

    // 2. Trajectory Guide (Dashed predicted path)
    if (options.showTrajectory && trajectoryPoints.length > 1) {
      this.drawTrajectory(ctx, trajectoryPoints, options);
    }

    // 3. Walls and Deflectors
    this.drawWalls(ctx, walls, options);

    // 4. Asteroid Hazards
    this.drawHazards(ctx, hazards, options);

    // 5. Gravity Objects (Attractors, Repellers, Directional fields, Orbit rings, Gravity walls)
    this.drawGravityObjects(ctx, objects, timeMs, options);

    // 6. Placement Preview (Ghost object if hovering/targeting)
    if (selectedPlacementPos && selectedPlacementType) {
      this.drawPlacementGhost(ctx, selectedPlacementPos, selectedPlacementType, timeMs);
    }

    // 7. Cosmic Cup / Hole
    this.drawCup(ctx, cup, timeMs, options);

    // 8. Ball and Trail
    this.drawBall(ctx, ball, options);

    ctx.restore();
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    timeMs: number,
    options: RenderOptions,
  ): void {
    // Deep cosmic gradient
    const bgGrad = ctx.createLinearGradient(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    if (options.highContrast) {
      bgGrad.addColorStop(0, '#000000');
      bgGrad.addColorStop(1, '#05070d');
    } else {
      bgGrad.addColorStop(0, '#070b14');
      bgGrad.addColorStop(0.5, '#0b1120');
      bgGrad.addColorStop(1, '#060912');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

    // Nebula glow patches
    if (!options.reducedMotion && !options.highContrast) {
      const g1 = ctx.createRadialGradient(250, 180, 20, 250, 180, 260);
      g1.addColorStop(0, 'rgba(56, 189, 248, 0.04)');
      g1.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

      const g2 = ctx.createRadialGradient(750, 420, 30, 750, 420, 300);
      g2.addColorStop(0, 'rgba(168, 85, 247, 0.04)');
      g2.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
    }

    // Starfield
    for (const star of this.stars) {
      const twinkle = options.reducedMotion
        ? star.brightness
        : star.brightness * (0.7 + 0.3 * Math.sin(timeMs * 0.002 + star.phase));
      ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawTrajectory(
    ctx: CanvasRenderingContext2D,
    points: Vector2D[],
    options: RenderOptions,
  ): void {
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = options.highContrast ? '#ffffff' : 'rgba(56, 189, 248, 0.55)';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Spaced glowing trajectory beads
    ctx.setLineDash([]);
    for (let i = 0; i < points.length; i += 4) {
      ctx.fillStyle = options.highContrast ? '#38bdf8' : 'rgba(56, 189, 248, 0.8)';
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawWalls(
    ctx: CanvasRenderingContext2D,
    walls: WallSegment[],
    options: RenderOptions,
  ): void {
    ctx.save();
    for (const w of walls) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = options.highContrast ? '#94a3b8' : 'rgba(71, 85, 105, 0.8)';
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.stroke();

      // Glowing edge accent
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = options.highContrast ? '#ffffff' : 'rgba(148, 163, 184, 0.9)';
      ctx.beginPath();
      ctx.moveTo(w.x1, w.y1);
      ctx.lineTo(w.x2, w.y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawHazards(
    ctx: CanvasRenderingContext2D,
    hazards: AsteroidHazard[],
    options: RenderOptions,
  ): void {
    ctx.save();
    for (const h of hazards) {
      // Hazard glow
      const grad = ctx.createRadialGradient(
        h.position.x,
        h.position.y,
        4,
        h.position.x,
        h.position.y,
        h.radius,
      );
      grad.addColorStop(0, options.highContrast ? '#b91c1c' : '#7f1d1d');
      grad.addColorStop(0.7, '#450a0a');
      grad.addColorStop(1, '#1c0505');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(h.position.x, h.position.y, h.radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer hazard ring
      ctx.strokeStyle = options.highContrast ? '#ef4444' : 'rgba(239, 68, 68, 0.65)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner crater details
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.arc(
        h.position.x - h.radius * 0.3,
        h.position.y - h.radius * 0.2,
        h.radius * 0.28,
        0,
        Math.PI * 2,
      );
      ctx.arc(
        h.position.x + h.radius * 0.2,
        h.position.y + h.radius * 0.3,
        h.radius * 0.22,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.restore();
  }

  private drawGravityObjects(
    ctx: CanvasRenderingContext2D,
    objects: GravityObject[],
    timeMs: number,
    options: RenderOptions,
  ): void {
    for (const obj of objects) {
      const pulse = options.reducedMotion
        ? 1
        : 1 + 0.08 * Math.sin(timeMs * 0.004 + obj.position.x);

      switch (obj.type) {
        case 'attractor': {
          // Radiating cyan gravitational ripple
          const grad = ctx.createRadialGradient(
            obj.position.x,
            obj.position.y,
            3,
            obj.position.x,
            obj.position.y,
            obj.radius * 2.2 * pulse,
          );
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.75)');
          grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.2)');
          grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius * 2.2 * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Core well
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Inner singularity
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius * 0.35, 0, Math.PI * 2);
          ctx.fill();

          // Inward arrows icon
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius * 1.2, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'repeller': {
          // Radiating magenta shield
          const grad = ctx.createRadialGradient(
            obj.position.x,
            obj.position.y,
            4,
            obj.position.x,
            obj.position.y,
            obj.radius * 2.4 * pulse,
          );
          grad.addColorStop(0, 'rgba(236, 72, 153, 0.7)');
          grad.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
          grad.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius * 2.4 * pulse, 0, Math.PI * 2);
          ctx.fill();

          // Core repeller
          ctx.fillStyle = '#be185d';
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Outer shockwave ring
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius * 1.4 * pulse, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case 'directional': {
          // Directional vector cone
          const dir = obj.direction || { x: 1, y: 0 };
          const angle = Math.atan2(dir.y, dir.x);
          ctx.save();
          ctx.translate(obj.position.x, obj.position.y);
          ctx.rotate(angle);

          // Flow zone
          ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
          ctx.beginPath();
          ctx.arc(0, 0, obj.radius, -0.6, 0.6);
          ctx.lineTo(0, 0);
          ctx.fill();

          // Thrust arrows
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-15, 0);
          ctx.lineTo(25, 0);
          ctx.lineTo(12, -10);
          ctx.moveTo(25, 0);
          ctx.lineTo(12, 10);
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 'orbit-ring': {
          // Vortex rail
          ctx.save();
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.8)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, obj.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Orbit center
          ctx.fillStyle = '#0f766e';
          ctx.beginPath();
          ctx.arc(obj.position.x, obj.position.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }

        case 'gravity-wall': {
          // Elastic deflector bar
          const len = obj.length || 80;
          const ang = obj.angle || 0;
          ctx.save();
          ctx.translate(obj.position.x, obj.position.y);
          ctx.rotate(ang);

          // Glowing deflector line
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(-len / 2, 0);
          ctx.lineTo(len / 2, 0);
          ctx.stroke();

          // Endcaps
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.arc(-len / 2, 0, 4, 0, Math.PI * 2);
          ctx.arc(len / 2, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
  }

  private drawPlacementGhost(
    ctx: CanvasRenderingContext2D,
    pos: Vector2D,
    type: string,
    timeMs: number,
  ): void {
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.2 * Math.sin(timeMs * 0.008);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);

    if (type === 'attractor') {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'repeller') {
      ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'directional') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'orbit-ring') {
      ctx.fillStyle = 'rgba(45, 212, 191, 0.3)';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (type === 'gravity-wall') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.fillRect(pos.x - 40, pos.y - 3, 80, 6);
      ctx.strokeRect(pos.x - 40, pos.y - 3, 80, 6);
    }
    ctx.restore();
  }

  private drawCup(
    ctx: CanvasRenderingContext2D,
    cup: CosmicCup,
    timeMs: number,
    options: RenderOptions,
  ): void {
    ctx.save();
    const pulse = options.reducedMotion ? 1 : 1 + 0.06 * Math.sin(timeMs * 0.005);

    // Accretion disk glow around hole
    const diskGrad = ctx.createRadialGradient(
      cup.position.x,
      cup.position.y,
      cup.radius * 0.5,
      cup.position.x,
      cup.position.y,
      cup.captureRadius * 1.3 * pulse,
    );
    diskGrad.addColorStop(0, 'rgba(245, 158, 11, 0.8)');
    diskGrad.addColorStop(0.5, 'rgba(234, 88, 12, 0.3)');
    diskGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = diskGrad;
    ctx.beginPath();
    ctx.arc(cup.position.x, cup.position.y, cup.captureRadius * 1.3 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Event horizon (the hole center)
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cup.position.x, cup.position.y, cup.radius, 0, Math.PI * 2);
    ctx.fill();

    // Bright rim
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Cosmic pin flag
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cup.position.x, cup.position.y);
    ctx.lineTo(cup.position.x, cup.position.y - 28);
    ctx.stroke();

    // Triangular flag banner
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cup.position.x, cup.position.y - 28);
    ctx.lineTo(cup.position.x + 16, cup.position.y - 21);
    ctx.lineTo(cup.position.x, cup.position.y - 14);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawBall(ctx: CanvasRenderingContext2D, ball: BallState, options: RenderOptions): void {
    ctx.save();

    // Particle trail
    if (ball.trail.length > 1) {
      for (let i = 0; i < ball.trail.length; i++) {
        const pt = ball.trail[i];
        const alpha = (i / ball.trail.length) * 0.65;
        const size = ball.radius * (0.3 + 0.7 * (i / ball.trail.length));

        ctx.fillStyle = options.highContrast
          ? `rgba(255, 255, 255, ${alpha})`
          : `rgba(245, 158, 11, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ball glow
    const glowGrad = ctx.createRadialGradient(
      ball.position.x,
      ball.position.y,
      2,
      ball.position.x,
      ball.position.y,
      ball.radius * 2.2,
    );
    glowGrad.addColorStop(0, '#ffffff');
    glowGrad.addColorStop(0.5, '#fef08a');
    glowGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Golf orb body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(ball.position.x - 2, ball.position.y - 2, ball.radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
