import type {
  ArenaState,
  LavaArenaConfig,
  LavaPlayer,
  PowerUpInstance,
  TileData,
} from '../types/floor-is-lava.types';

export interface RenderLavaState {
  arena: ArenaState;
  config: LavaArenaConfig;
  localPlayerId: string | null;
  timeMs: number;
}

export function renderFloorIsLavaFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: RenderLavaState,
): void {
  const { arena, config, localPlayerId, timeMs } = state;

  // Clear canvas with deep magma abyss
  ctx.fillStyle = '#140505';
  ctx.fillRect(0, 0, width, height);

  // Compute arena dimensions & center offset
  const arenaWidth = config.cols * (config.tileSize + config.tileGap) - config.tileGap;
  const arenaHeight = config.rows * (config.tileSize + config.tileGap) - config.tileGap;

  const offsetX = (width - arenaWidth) / 2;
  const offsetY = (height - arenaHeight) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);

  // 1. Render Molten Lava Bed under the tiles
  drawLavaBed(ctx, arenaWidth, arenaHeight, timeMs, arena.frozenSec > 0);

  // 2. Render Tiles
  arena.tiles.forEach((row) => {
    row.forEach((tile) => {
      drawTile(ctx, tile, timeMs);
    });
  });

  // 3. Render Power-Ups
  arena.powerUps.forEach((pw) => {
    drawPowerUp(ctx, pw, timeMs);
  });

  // 4. Render Players
  arena.players.forEach((player) => {
    drawPlayer(ctx, player, player.id === localPlayerId, timeMs);
  });

  ctx.restore();
}

function drawLavaBed(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeMs: number,
  isFrozen: boolean,
): void {
  // Bubbling lava background with heat gradient
  const margin = 80;
  const grad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    100,
    width / 2,
    height / 2,
    Math.max(width, height) / 1.5,
  );

  if (isFrozen) {
    grad.addColorStop(0, '#0c4a6e');
    grad.addColorStop(1, '#021e31');
  } else {
    grad.addColorStop(0, '#b91c1c');
    grad.addColorStop(0.6, '#7f1d1d');
    grad.addColorStop(1, '#450a0a');
  }

  ctx.fillStyle = grad;
  ctx.fillRect(-margin, -margin, width + margin * 2, height + margin * 2);

  // Magma bubbles
  if (!isFrozen) {
    ctx.fillStyle = 'rgba(251, 146, 60, 0.4)';
    for (let i = 0; i < 18; i++) {
      const bx = ((i * 137 + timeMs * 0.05) % (width + 60)) - 30;
      const by = ((i * 211 + timeMs * 0.03) % (height + 60)) - 30;
      const r = 4 + 6 * Math.sin(timeMs * 0.004 + i);
      if (r > 0) {
        ctx.beginPath();
        ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawTile(ctx: CanvasRenderingContext2D, tile: TileData, timeMs: number): void {
  const { x, y, size, state, stability } = tile;

  if (state === 'lava') {
    // Open molten lava pit with churning glow
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(x, y, size, size);

    const bubble = 0.5 + 0.5 * Math.sin(timeMs * 0.006 + x + y);
    ctx.fillStyle = `rgba(239, 68, 68, ${0.4 * bubble})`;
    ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
    return;
  }

  if (state === 'temporary') {
    // Floating energy shield platform
    const pulse = 0.6 + 0.4 * Math.sin(timeMs * 0.008);
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(x, y, size, size);

    ctx.strokeStyle = `rgba(52, 211, 153, ${pulse})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
    return;
  }

  // Base tile surface
  let fillColor = '#1e293b'; // safe slate
  let borderColor = '#38bdf8'; // safe cyan

  if (state === 'warning') {
    fillColor = '#331e14';
    borderColor = '#f59e0b';
  } else if (state === 'cracking') {
    fillColor = '#45100a';
    borderColor = '#ef4444';
  }

  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, size, size);

  // Border glow
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = state === 'cracking' ? 2.5 : 1.5;
  ctx.strokeRect(x, y, size, size);

  // Fissure cracks for warning and cracking states
  if (state === 'warning' || state === 'cracking') {
    ctx.strokeStyle = state === 'cracking' ? '#f87171' : '#fbbf24';
    ctx.lineWidth = state === 'cracking' ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2, y + size * 0.3);
    ctx.lineTo(x + size * 0.5, y + size * 0.5);
    ctx.lineTo(x + size * 0.8, y + size * 0.7);

    if (state === 'cracking') {
      ctx.moveTo(x + size * 0.5, y + size * 0.5);
      ctx.lineTo(x + size * 0.3, y + size * 0.8);
    }
    ctx.stroke();
  }

  // Stability progress bar at the bottom of cracking tiles
  if (state === 'cracking' || state === 'warning') {
    const barHeight = 3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x, y + size - barHeight, size, barHeight);

    ctx.fillStyle = state === 'cracking' ? '#ef4444' : '#f59e0b';
    ctx.fillRect(x, y + size - barHeight, size * Math.max(0, stability), barHeight);
  }
}

function drawPowerUp(ctx: CanvasRenderingContext2D, pw: PowerUpInstance, timeMs: number): void {
  const floatOffset = Math.sin(timeMs * 0.007 + pw.x) * 4;
  const cy = pw.y + floatOffset;

  ctx.save();
  ctx.translate(pw.x, cy);

  // Rotating aura ring
  ctx.rotate(timeMs * 0.003);
  let auraColor = '#38bdf8';
  let iconChar = '🛡️';

  switch (pw.type) {
    case 'platform':
      auraColor = '#10b981';
      iconChar = '🟩';
      break;
    case 'super-push':
      auraColor = '#ef4444';
      iconChar = '💥';
      break;
    case 'freeze':
      auraColor = '#38bdf8';
      iconChar = '❄️';
      break;
    case 'double-jump':
      auraColor = '#f59e0b';
      iconChar = '🪽';
      break;
  }

  ctx.fillStyle = `rgba(${pw.type === 'super-push' ? '239,68,68' : '56,189,248'}, 0.2)`;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = auraColor;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Icon symbol
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(iconChar, pw.x, cy);
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: LavaPlayer,
  isLocal: boolean,
  timeMs: number,
): void {
  const { position, radius, color, name, avatar, isAlive, isPushing, activePowerUp } = player;

  if (!isAlive) {
    // Sizzled ghost particle
    ctx.save();
    ctx.globalAlpha = 0.3 + 0.2 * Math.sin(timeMs * 0.02);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Push shockwave animation
  if (isPushing) {
    ctx.strokeStyle = activePowerUp?.type === 'super-push' ? '#ef4444' : '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius + 24, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Power-up aura
  if (activePowerUp) {
    ctx.strokeStyle = activePowerUp.type === 'freeze' ? '#38bdf8' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Local player focus ring
  if (isLocal) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius + 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Player body circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Avatar inside
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(avatar, position.x, position.y);

  // Name Tag
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(name, position.x, position.y - radius - 8);
}
