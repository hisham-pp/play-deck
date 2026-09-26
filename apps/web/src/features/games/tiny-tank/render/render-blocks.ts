import {
  BLOCK_BARREL,
  BLOCK_BRICK,
  BLOCK_STEEL,
  TANK_COLOR_SLATE_800,
  type ArenaBlock,
} from '../types/tiny-tank.types';

function renderSteelBlock(ctx: CanvasRenderingContext2D, b: ArenaBlock, highContrast: boolean) {
  ctx.fillStyle = highContrast ? '#334155' : TANK_COLOR_SLATE_800;
  ctx.fillRect(b.x, b.y, b.width, b.height);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x + 1, b.y + 1, b.width - 2, b.height - 2);

  ctx.fillStyle = '#64748b';
  const r = 2;
  ctx.beginPath();
  ctx.arc(b.x + 6, b.y + 6, r, 0, Math.PI * 2);
  ctx.arc(b.x + b.width - 6, b.y + 6, r, 0, Math.PI * 2);
  ctx.arc(b.x + 6, b.y + b.height - 6, r, 0, Math.PI * 2);
  ctx.arc(b.x + b.width - 6, b.y + b.height - 6, r, 0, Math.PI * 2);
  ctx.fill();
}

function renderBrickBlock(ctx: CanvasRenderingContext2D, b: ArenaBlock, highContrast: boolean) {
  const damageRatio = 1 - b.health / b.maxHealth;
  ctx.fillStyle = highContrast ? '#9a3412' : '#7c2d12';
  ctx.fillRect(b.x, b.y, b.width, b.height);

  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(b.x, b.y + b.height / 2);
  ctx.lineTo(b.x + b.width, b.y + b.height / 2);
  ctx.moveTo(b.x + b.width / 2, b.y);
  ctx.lineTo(b.x + b.width / 2, b.y + b.height / 2);
  ctx.moveTo(b.x + b.width / 4, b.y + b.height / 2);
  ctx.lineTo(b.x + b.width / 4, b.y + b.height);
  ctx.moveTo(b.x + (b.width * 3) / 4, b.y + b.height / 2);
  ctx.lineTo(b.x + (b.width * 3) / 4, b.y + b.height);
  ctx.stroke();

  if (damageRatio > 0.3) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x + 8, b.y + 6);
    ctx.lineTo(b.x + 22, b.y + 24);
    ctx.lineTo(b.x + 32, b.y + 30);
    ctx.stroke();
  }
}

function renderBarrelBlock(ctx: CanvasRenderingContext2D, b: ArenaBlock) {
  const cx = b.x + b.width / 2;
  const cy = b.y + b.height / 2;
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(cx, cy, b.width / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
}

export function renderBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: ArenaBlock[],
  highContrast: boolean,
): void {
  for (const b of blocks) {
    if (b.health <= 0) continue;

    ctx.save();
    if (b.type === BLOCK_STEEL) {
      renderSteelBlock(ctx, b, highContrast);
    } else if (b.type === BLOCK_BRICK) {
      renderBrickBlock(ctx, b, highContrast);
    } else if (b.type === BLOCK_BARREL) {
      renderBarrelBlock(ctx, b);
    }
    ctx.restore();
  }
}
