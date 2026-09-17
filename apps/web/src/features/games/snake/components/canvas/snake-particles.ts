/**
 * Particle system and visual FX for 2D Snake
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  radius: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'sparkle' | 'ring';
}

export interface ScoreFloater {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
  maxLife: number;
}

export interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  lineWidth: number;
}

export class SnakeParticleSystem {
  private particles: Particle[] = [];
  private scoreFloaters: ScoreFloater[] = [];
  private shockwaves: Shockwave[] = [];
  private screenShakeAmount: number = 0;

  public triggerEatBurst(x: number, y: number, color: string = '#f59e0b'): void {
    const count = 18;
    const colors = [color, '#fbbf24', '#34d399', '#6ee7b7', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.8 + Math.random() * 3.5;
      const c = colors[Math.floor(Math.random() * colors.length)];
      const maxLife = 35 + Math.floor(Math.random() * 20);

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: c,
        alpha: 1.0,
        radius: 2 + Math.random() * 3,
        life: 0,
        maxLife,
        shape: Math.random() > 0.4 ? 'sparkle' : 'circle',
      });
    }

    // Add glowing mini-shockwave
    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius: 36,
      color: '#fbbf24',
      alpha: 0.9,
      lineWidth: 3,
    });
  }

  public triggerScorePopup(x: number, y: number, text: string = '+10'): void {
    this.scoreFloaters.push({
      x,
      y: y - 10,
      text,
      color: '#f59e0b',
      alpha: 1.0,
      scale: 1.2,
      life: 0,
      maxLife: 45,
    });
  }

  public triggerTailTrail(x: number, y: number, color: string = '#10b981'): void {
    if (this.particles.length > 50) return; // Keep performance light
    this.particles.push({
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color,
      alpha: 0.4,
      radius: 2 + Math.random() * 2,
      life: 0,
      maxLife: 20,
      shape: 'circle',
    });
  }

  public triggerGameOver(x: number, y: number): void {
    this.screenShakeAmount = 8;

    // Expanding red/amber shockwaves
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius: 70,
      color: '#ef4444',
      alpha: 1.0,
      lineWidth: 4,
    });
    this.shockwaves.push({
      x,
      y,
      radius: 2,
      maxRadius: 45,
      color: '#f59e0b',
      alpha: 0.8,
      lineWidth: 3,
    });

    // Particle explosion
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.5 ? '#ef4444' : '#f59e0b',
        alpha: 1.0,
        radius: 2.5 + Math.random() * 3.5,
        life: 0,
        maxLife: 40 + Math.floor(Math.random() * 25),
        shape: 'sparkle',
      });
    }
  }

  public update(): { shakeX: number; shakeY: number } {
    // Screen shake decay
    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShakeAmount > 0.05) {
      shakeX = (Math.random() - 0.5) * this.screenShakeAmount * 2;
      shakeY = (Math.random() - 0.5) * this.screenShakeAmount * 2;
      this.screenShakeAmount *= 0.88;
    } else {
      this.screenShakeAmount = 0;
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update score floaters
    for (let i = this.scoreFloaters.length - 1; i >= 0; i--) {
      const f = this.scoreFloaters[i];
      f.y -= 0.8;
      f.life++;
      const progress = f.life / f.maxLife;
      f.alpha = Math.max(0, 1 - progress * progress);
      f.scale = 1.2 - progress * 0.3;

      if (f.life >= f.maxLife) {
        this.scoreFloaters.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += (s.maxRadius - s.radius) * 0.12 + 1.2;
      s.alpha = Math.max(0, 1 - s.radius / s.maxRadius);

      if (s.radius >= s.maxRadius || s.alpha <= 0.02) {
        this.shockwaves.splice(i, 1);
      }
    }

    return { shakeX, shakeY };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Render shockwaves
    for (const s of this.shockwaves) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(0.1, s.radius), 0, Math.PI * 2);
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.lineWidth = s.lineWidth;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
    }

    // Render particles
    for (const p of this.particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;

      if (p.shape === 'sparkle') {
        const r = p.radius * (1 - (p.life / p.maxLife) * 0.4);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r * 1.5);
        ctx.lineTo(p.x + r * 0.5, p.y);
        ctx.lineTo(p.x + r * 1.5, p.y);
        ctx.lineTo(p.x + r * 0.5, p.y + r * 0.5);
        ctx.lineTo(p.x, p.y + r * 1.5);
        ctx.lineTo(p.x - r * 0.5, p.y + r * 0.5);
        ctx.lineTo(p.x - r * 1.5, p.y);
        ctx.lineTo(p.x - r * 0.5, p.y);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(
          p.x,
          p.y,
          Math.max(0.5, p.radius * (1 - (p.life / p.maxLife) * 0.5)),
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Render score popups
    ctx.shadowBlur = 12;
    ctx.font = 'bold 15px monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const f of this.scoreFloaters) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(f.scale, f.scale);
      ctx.globalAlpha = f.alpha;
      ctx.shadowColor = f.color;
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  public clear(): void {
    this.particles = [];
    this.scoreFloaters = [];
    this.shockwaves = [];
    this.screenShakeAmount = 0;
  }
}
