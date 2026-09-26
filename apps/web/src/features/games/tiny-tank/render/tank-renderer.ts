import {
  TANK_COLOR_SLATE_800,
  type TinyTankArenaState,
  type TinyTankConfig,
  type Vector2D,
} from '../types/tiny-tank.types';
import { renderBlocks } from './render-blocks';
import {
  renderCrates,
  renderCrosshair,
  renderExplosions,
  renderMines,
  renderProjectiles,
  renderTreadMarks,
} from './render-entities';
import { renderTank } from './render-tank';

export function renderTinyTankArena(
  ctx: CanvasRenderingContext2D,
  state: TinyTankArenaState,
  config: TinyTankConfig,
  localPlayerId: string,
  mousePos: Vector2D | null,
): void {
  const { arenaWidth, arenaHeight } = state;

  // Clear & Arena Floor
  ctx.save();
  ctx.fillStyle = config.highContrast ? '#05070c' : '#0d121f';
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);

  // Floor grid
  ctx.strokeStyle = config.highContrast ? TANK_COLOR_SLATE_800 : 'rgba(30, 41, 59, 0.4)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  ctx.beginPath();
  for (let x = 0; x <= arenaWidth; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, arenaHeight);
  }
  for (let y = 0; y <= arenaHeight; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(arenaWidth, y);
  }
  ctx.stroke();

  // Entities & Effects
  renderTreadMarks(ctx, state.treadMarks);
  renderBlocks(ctx, state.blocks, config.highContrast);
  renderCrates(ctx, state.crates);
  renderMines(ctx, state.mines);

  for (const tank of state.players) {
    renderTank(ctx, tank, tank.id === localPlayerId, config.highContrast);
  }

  renderProjectiles(ctx, state.projectiles);
  renderExplosions(ctx, state.explosions);

  if (mousePos && state.status === 'playing') {
    renderCrosshair(ctx, mousePos);
  }

  ctx.restore();
}
