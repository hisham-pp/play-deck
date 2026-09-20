import type {
  DashPlayer,
  FloatingScore,
  LootDashArenaState,
  LootItem,
  ObstacleBlock,
  Particle,
  Trap,
} from '../types/loot-dash.types';

export interface RenderOptions {
  highContrast?: boolean;
  reducedMotion?: boolean;
}

const COLOR_CANVAS_BG = '#090d16';
const COLOR_GRID_LINE = 'rgba(255, 255, 255, 0.04)';
const COLOR_BORDER = '#232f45';
const COLOR_WALL = '#1e293b';
const COLOR_BUMPER = '#0ea5e9';
const COLOR_BUMPER_CORE = '#38bdf8';

export class LootRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    state: LootDashArenaState,
    options: RenderOptions = {},
  ): void {
    const { arenaWidth, arenaHeight } = state;

    ctx.clearRect(0, 0, arenaWidth, arenaHeight);

    // Background
    ctx.fillStyle = COLOR_CANVAS_BG;
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    this.renderGrid(ctx, arenaWidth, arenaHeight);
    this.renderObstacles(ctx, state.obstacles);
    this.renderTraps(ctx, state.traps);
    this.renderLoot(ctx, state.loot, options);
    this.renderPlayers(ctx, state.players, options);
    this.renderParticles(ctx, state.particles);
    this.renderScores(ctx, state.scores);
  }

  private renderGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const gridSize = 40;
    ctx.strokeStyle = COLOR_GRID_LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = gridSize; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = gridSize; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Arena Outer Boundary
    ctx.strokeStyle = COLOR_BORDER;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, width - 3, height - 3);
  }

  private renderObstacles(ctx: CanvasRenderingContext2D, obstacles: ObstacleBlock[]): void {
    for (const ob of obstacles) {
      if (ob.type === 'wall') {
        ctx.fillStyle = COLOR_WALL;
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(ob.x, ob.y, ob.width, ob.height);

        // Highlight stripe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(ob.x + 2, ob.y + 2, ob.width - 4, 4);
      } else {
        // Bumper
        ctx.fillStyle = COLOR_BUMPER;
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);

        ctx.fillStyle = COLOR_BUMPER_CORE;
        ctx.fillRect(ob.x + 4, ob.y + 4, ob.width - 8, ob.height - 8);

        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ob.x, ob.y, ob.width, ob.height);
      }
    }
  }

  private renderTraps(ctx: CanvasRenderingContext2D, traps: Trap[]): void {
    for (const trap of traps) {
      if (trap.type === 'spikes') {
        this.renderSpikes(ctx, trap);
      } else if (trap.type === 'slime') {
        this.renderSlime(ctx, trap);
      } else {
        this.renderDecoy(ctx, trap);
      }
    }
  }

  private renderSpikes(ctx: CanvasRenderingContext2D, trap: Trap): void {
    const { position, width, height, isActive } = trap;
    const x = position.x - width / 2;
    const y = position.y - height / 2;

    ctx.fillStyle = isActive ? 'rgba(239, 68, 68, 0.25)' : 'rgba(71, 85, 105, 0.3)';
    ctx.fillRect(x, y, width, height);

    ctx.strokeStyle = isActive ? '#ef4444' : '#64748b';
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.strokeRect(x, y, width, height);

    if (isActive) {
      // Draw spike teeth
      ctx.fillStyle = '#f87171';
      const spikeCount = 3;
      const step = width / spikeCount;
      for (let i = 0; i < spikeCount; i++) {
        const sx = x + i * step;
        ctx.beginPath();
        ctx.moveTo(sx, y + height);
        ctx.lineTo(sx + step / 2, y + 4);
        ctx.lineTo(sx + step, y + height);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Inactive marker
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(position.x, position.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderSlime(ctx: CanvasRenderingContext2D, trap: Trap): void {
    const { position, width, height } = trap;
    ctx.save();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.35)';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(position.x, position.y, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Small bubbles
    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(position.x - 6, position.y - 4, 3, 0, Math.PI * 2);
    ctx.arc(position.x + 8, position.y + 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private renderDecoy(ctx: CanvasRenderingContext2D, trap: Trap): void {
    const { position } = trap;
    ctx.save();
    ctx.translate(position.x, position.y);

    // Gem shape
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(10, 0);
    ctx.lineTo(0, 12);
    ctx.lineTo(-10, 0);
    ctx.closePath();
    ctx.fill();

    // Faint warning skull / exclamation
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', 0, 0);

    ctx.restore();
  }

  private renderLoot(
    ctx: CanvasRenderingContext2D,
    lootItems: LootItem[],
    options: RenderOptions,
  ): void {
    for (const item of lootItems) {
      const pulse = options.reducedMotion ? 1 : 1 + Math.sin(item.pulseTimer * 4) * 0.08;
      const r = item.radius * pulse;

      ctx.save();
      ctx.translate(item.position.x, item.position.y);

      switch (item.type) {
        case 'bronze_coin':
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          break;

        case 'silver_coin':
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          break;

        case 'gold_bar':
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-r, -r * 0.6, r * 2, r * 1.2);
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-r, -r * 0.6, r * 2, r * 1.2);
          break;

        case 'gem':
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.2);
          ctx.lineTo(r, 0);
          ctx.lineTo(0, r * 1.2);
          ctx.lineTo(-r, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#bae6fd';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          break;

        case 'chest':
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-r, -r * 0.75, r * 2, r * 1.5);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-r, -r * 0.75, r * 2, 4); // lid trim
          ctx.fillRect(-3, -2, 6, 6); // gold lock
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-r, -r * 0.75, r * 2, r * 1.5);
          break;
      }

      ctx.restore();
    }
  }

  private renderPlayers(
    ctx: CanvasRenderingContext2D,
    players: DashPlayer[],
    _options: RenderOptions,
  ): void {
    for (const player of players) {
      if (!player.isAlive) continue;

      ctx.save();
      ctx.translate(player.position.x, player.position.y);

      // Invulnerable flicker
      if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 10) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Power-up aura
      this.renderPlayerAura(ctx, player);

      // Player Body
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Heading Visor / Eye
      const eyeX = Math.cos(player.angle) * (player.radius * 0.55);
      const eyeY = Math.sin(player.angle) * (player.radius * 0.55);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Stun / Slow Indicator
      if (player.stunTimer > 0) {
        this.renderStun(ctx, player.radius);
      } else if (player.slowTimer > 0) {
        this.renderSlow(ctx, player.radius);
      }

      // Name & Score Tag
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`${player.name} (${player.score})`, 0, -player.radius - 8);

      ctx.restore();
    }
  }

  private renderPlayerAura(ctx: CanvasRenderingContext2D, player: DashPlayer): void {
    if (!player.activePowerUp) return;

    if (player.activePowerUp === 'shield') {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    } else if (player.activePowerUp === 'magnet') {
      ctx.strokeStyle = '#3b82f6';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (player.activePowerUp === 'speed') {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (player.activePowerUp === 'thief') {
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private renderStun(ctx: CanvasRenderingContext2D, radius: number): void {
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💫', 0, -radius - 20);
  }

  private renderSlow(ctx: CanvasRenderingContext2D, radius: number): void {
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🟢', 0, -radius - 20);
  }

  private renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private renderScores(ctx: CanvasRenderingContext2D, scores: FloatingScore[]): void {
    for (const s of scores) {
      const alpha = Math.max(0, s.lifetime / s.maxLifetime);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = s.color;
      ctx.textAlign = 'center';
      ctx.fillText(s.text, s.x, s.y);
      ctx.restore();
    }
  }
}
