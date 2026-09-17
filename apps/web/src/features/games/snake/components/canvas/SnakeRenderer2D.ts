import type { Coordinate, Direction, SnakeGameStatus } from '../../types/snake.types';
import type { SnakeParticleSystem } from './snake-particles';

export type SnakeTheme = 'grass' | 'arcade';

export interface SnakeRendererOptions {
  gridSize: number;
  theme?: SnakeTheme;
}

const DIRECTION_ANGLES: Record<Direction, number> = {
  RIGHT: 0,
  DOWN: Math.PI / 2,
  LEFT: Math.PI,
  UP: -Math.PI / 2,
};

export class SnakeRenderer2D {
  private gridSize: number;
  private theme: SnakeTheme;

  constructor(options: SnakeRendererOptions) {
    this.gridSize = options.gridSize;
    this.theme = options.theme ?? 'grass';
  }

  public setGridSize(size: number): void {
    this.gridSize = size;
  }

  public setTheme(theme: SnakeTheme): void {
    this.theme = theme;
  }

  public getTheme(): SnakeTheme {
    return this.theme;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    snake: Coordinate[],
    food: Coordinate,
    direction: Direction,
    status: SnakeGameStatus,
    particles: SnakeParticleSystem,
    interpolationProgress: number = 1.0,
    prevSnake?: Coordinate[],
    time: number = 0,
  ): void {
    ctx.clearRect(0, 0, width, height);

    const { shakeX, shakeY } = particles.update();

    ctx.save();
    ctx.translate(shakeX, shakeY);

    const cellSize = width / this.gridSize;

    // 1. Draw Checkered Grass Board (Google Snake Style)
    this.drawBoard(ctx, width, height, cellSize);

    // 2. Calculate Smooth Positions for 60fps slither
    const smoothPositions = this.calculateSmoothSnake(
      snake,
      prevSnake,
      interpolationProgress,
      cellSize,
    );

    // 3. Draw Apple (with ground shadow, specular highlight, stem & leaf)
    this.drawApple(ctx, food, cellSize, time);

    // 4. Draw Snake Body & Head
    if (smoothPositions.length > 0) {
      this.drawSnake(ctx, smoothPositions, direction, cellSize, status, time);
    }

    // 5. Draw Particles & Score popups
    particles.render(ctx);

    ctx.restore();
  }

  private drawBoard(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    cellSize: number,
  ): void {
    if (this.theme === 'arcade') {
      // Dark Arcade Theme
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.1,
        width / 2,
        height / 2,
        width * 0.75,
      );
      bgGrad.addColorStop(0, '#0c121e');
      bgGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Dot grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      const dotRadius = Math.max(1, cellSize * 0.04);
      for (let x = 1; x < this.gridSize; x++) {
        for (let y = 1; y < this.gridSize; y++) {
          ctx.beginPath();
          ctx.arc(x * cellSize, y * cellSize, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, width - 2, height - 2);
      return;
    }

    // Google Snake Checkered Grass Palette:
    // Alternating fresh green squares
    const colorLight = '#a2d149';
    const colorDark = '#aad751';

    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? colorLight : colorDark;
        ctx.fillRect(x * cellSize, y * cellSize, Math.ceil(cellSize), Math.ceil(cellSize));
      }
    }

    // Outer subtle border
    ctx.strokeStyle = '#87b138';
    ctx.lineWidth = 2;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  }

  private calculateSmoothSnake(
    current: Coordinate[],
    previous: Coordinate[] | undefined,
    progress: number,
    cellSize: number,
  ): Array<{ x: number; y: number }> {
    if (!previous || previous.length === 0 || progress >= 1.0) {
      return current.map((c) => ({
        x: (c.x + 0.5) * cellSize,
        y: (c.y + 0.5) * cellSize,
      }));
    }

    const t = Math.max(0, Math.min(1, progress));
    const smooth: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < current.length; i++) {
      const cur = current[i];
      const prev = previous[i] ?? current[current.length - 1];

      const px = (prev.x * (1 - t) + cur.x * t + 0.5) * cellSize;
      const py = (prev.y * (1 - t) + cur.y * t + 0.5) * cellSize;
      smooth.push({ x: px, y: py });
    }

    return smooth;
  }

  private drawSnake(
    ctx: CanvasRenderingContext2D,
    points: Array<{ x: number; y: number }>,
    direction: Direction,
    cellSize: number,
    status: SnakeGameStatus,
    time: number,
  ): void {
    if (points.length === 0) return;

    const bodyWidth = cellSize * 0.76;
    const isArcade = this.theme === 'arcade';
    const bodyColor = isArcade ? '#10b981' : '#4671ea';
    const shadowColor = isArcade ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.16)';
    const shadowOffsetY = cellSize * 0.08;

    // 1. Draw Soft Drop Shadow Under the Entire Snake
    ctx.save();
    ctx.translate(0, shadowOffsetY);
    ctx.strokeStyle = shadowColor;
    ctx.lineWidth = bodyWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Shadow circle under head
    ctx.fillStyle = shadowColor;
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, bodyWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Draw Solid Connected Snake Body
    ctx.save();
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = bodyWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Fill the head circle so joint is seamless
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, bodyWidth / 2, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Snake Head Features (Eyes & Nostrils)
    this.drawHeadDetails(ctx, points[0], direction, cellSize, bodyWidth, bodyColor, status, time);

    ctx.restore();
  }

  private drawHeadDetails(
    ctx: CanvasRenderingContext2D,
    headPos: { x: number; y: number },
    direction: Direction,
    cellSize: number,
    bodyWidth: number,
    bodyColor: string,
    status: SnakeGameStatus,
    _time: number,
  ): void {
    ctx.save();
    ctx.translate(headPos.x, headPos.y);

    const angle = DIRECTION_ANGLES[direction] ?? 0;
    ctx.rotate(angle);

    const headRadius = bodyWidth / 2;

    // Eye placement: positioned on top and bottom relative to direction
    const eyeOffsetForward = headRadius * 0.22;
    const eyeOffsetSide = headRadius * 0.62;
    const eyeRadius = cellSize * 0.16;
    const pupilRadius = cellSize * 0.085;

    // Draw eye bumps (blue backing so eyes integrate naturally)
    [-eyeOffsetSide, eyeOffsetSide].forEach((yPos) => {
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(eyeOffsetForward, yPos, eyeRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Eyes (White Sclera)
    [-eyeOffsetSide, eyeOffsetSide].forEach((yPos) => {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeOffsetForward, yPos, eyeRadius, 0, Math.PI * 2);
      ctx.fill();

      if (status === 'game-over') {
        // Collision 'X' eyes
        ctx.strokeStyle = '#273c75';
        ctx.lineWidth = Math.max(2, cellSize * 0.05);
        ctx.lineCap = 'round';
        const cross = eyeRadius * 0.55;
        ctx.beginPath();
        ctx.moveTo(eyeOffsetForward - cross, yPos - cross);
        ctx.lineTo(eyeOffsetForward + cross, yPos + cross);
        ctx.moveTo(eyeOffsetForward + cross, yPos - cross);
        ctx.lineTo(eyeOffsetForward - cross, yPos + cross);
        ctx.stroke();
      } else {
        // Expressive dark pupils looking forward in travel direction
        const pupilForward = eyeOffsetForward + eyeRadius * 0.28;
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(pupilForward, yPos, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // White specular glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
          pupilForward + pupilRadius * 0.35,
          yPos - pupilRadius * 0.35,
          pupilRadius * 0.35,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    });

    // Cute Nostrils at the front snout
    const snoutX = headRadius * 0.72;
    const nostrilSpacing = headRadius * 0.26;
    const nostrilRadius = Math.max(1.2, cellSize * 0.038);
    const nostrilColor = this.theme === 'arcade' ? '#047857' : '#3252b8';

    ctx.fillStyle = nostrilColor;
    ctx.beginPath();
    ctx.arc(snoutX, -nostrilSpacing, nostrilRadius, 0, Math.PI * 2);
    ctx.arc(snoutX, nostrilSpacing, nostrilRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawApple(
    ctx: CanvasRenderingContext2D,
    food: Coordinate,
    cellSize: number,
    time: number,
  ): void {
    const fx = (food.x + 0.5) * cellSize;
    const fy = (food.y + 0.5) * cellSize;

    // Subtle gentle float animation
    const floatOffset = Math.sin(time * 0.005) * (cellSize * 0.02);
    const appleRadius = cellSize * 0.35;

    ctx.save();

    // 1. Soft ground shadow under apple
    ctx.fillStyle = this.theme === 'arcade' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(
      fx,
      fy + cellSize * 0.34,
      appleRadius * 0.85,
      appleRadius * 0.32,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // 2. Apple Body (Vibrant Red with slight 3D shading)
    const appleCenterY = fy + floatOffset;
    ctx.fillStyle = '#e7471d';
    ctx.beginPath();
    ctx.arc(fx, appleCenterY, appleRadius, 0, Math.PI * 2);
    ctx.fill();

    // 3. Specular Highlight (Soft white crescent/oval in upper left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.beginPath();
    ctx.ellipse(
      fx - appleRadius * 0.34,
      appleCenterY - appleRadius * 0.32,
      appleRadius * 0.32,
      appleRadius * 0.2,
      -Math.PI / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // 4. Wooden Brown Stem
    ctx.strokeStyle = '#8d4f27';
    ctx.lineWidth = Math.max(2, cellSize * 0.055);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(fx, appleCenterY - appleRadius * 0.8);
    ctx.quadraticCurveTo(
      fx + appleRadius * 0.15,
      appleCenterY - appleRadius * 1.25,
      fx + appleRadius * 0.1,
      appleCenterY - appleRadius * 1.35,
    );
    ctx.stroke();

    // 5. Fresh Green Leaf
    ctx.fillStyle = '#57b322';
    ctx.beginPath();
    ctx.ellipse(
      fx + appleRadius * 0.45,
      appleCenterY - appleRadius * 1.15,
      appleRadius * 0.32,
      appleRadius * 0.16,
      Math.PI / 5,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.restore();
  }
}
