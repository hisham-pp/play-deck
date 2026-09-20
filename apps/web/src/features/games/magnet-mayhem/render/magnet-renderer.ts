import type {
  BoostZone,
  HazardCoil,
  MagnetArenaState,
  MagnetPlayer,
  MetallicAnchor,
  Particle,
  RepelShockwave,
  TargetOrb,
} from '../types/magnet-mayhem.types';

export function renderMagnetArena(
  ctx: CanvasRenderingContext2D,
  state: MagnetArenaState,
  localPlayerId?: string,
): void {
  const { width, height } = state;

  ctx.save();

  // 1. Arena Canvas Background
  renderBackground(ctx, width, height);

  // 2. Boost Zones
  for (const boost of state.boostZones) {
    renderBoostZone(ctx, boost, state.elapsedSec);
  }

  // 3. Metallic Anchors
  for (const anchor of state.anchors) {
    renderAnchor(ctx, anchor, state.elapsedSec);
  }

  // 4. Hazard Coils
  for (const hazard of state.hazards) {
    renderHazardCoil(ctx, hazard);
  }

  // 5. Attract Tractor Beams
  for (const player of state.players) {
    if (player.isTethered && player.tetherTarget) {
      renderTractorBeam(ctx, player, player.tetherTarget, state.elapsedSec);
    }
  }

  // 6. Target Orbs
  for (const target of state.targets) {
    if (!target.isCollected) {
      renderTargetOrb(ctx, target);
    }
  }

  // 7. Repel Shockwaves
  for (const wave of state.shockwaves) {
    renderShockwave(ctx, wave);
  }

  // 8. Particles
  for (const particle of state.particles) {
    renderParticle(ctx, particle);
  }

  // 9. Players
  for (const player of state.players) {
    renderPlayer(ctx, player, player.id === localPlayerId, state.elapsedSec);
  }

  // 10. Floating Texts
  for (const ft of state.floatingTexts) {
    renderFloatingText(ctx, ft);
  }

  // 11. Countdown / Phase Overlays
  if (state.roundPhase === 'countdown') {
    renderCountdown(ctx, width, height, state.countdownSec);
  }

  ctx.restore();
}

function renderBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Deep space / dark arcade radial gradient
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    80,
    width / 2,
    height / 2,
    width * 0.75,
  );
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#060913');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Neon Grid Lines
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
  ctx.lineWidth = 1;
  const gridSize = 40;

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

  // Subtle Center Arena Ring
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, 140, 0, Math.PI * 2);
  ctx.stroke();

  // Arena Glowing Boundary
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 12;
  ctx.strokeRect(4, 4, width - 8, height - 8);
  ctx.shadowBlur = 0;
}

function renderBoostZone(
  ctx: CanvasRenderingContext2D,
  boost: BoostZone,
  elapsedSec: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
  ctx.lineWidth = 1.5;

  ctx.fillRect(boost.x, boost.y, boost.width, boost.height);
  ctx.strokeRect(boost.x, boost.y, boost.width, boost.height);

  // Animated chevrons inside
  const chevronOffset = (elapsedSec * 40) % 20;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 2;

  const centerY = boost.y + boost.height / 2;
  const startX = boost.boostDir.x > 0 ? boost.x + 8 : boost.x + boost.width - 8;
  const sign = boost.boostDir.x > 0 ? 1 : -1;

  for (let i = 0; i < 3; i++) {
    const cx = startX + sign * (i * 12 + chevronOffset);
    if (cx > boost.x + 4 && cx < boost.x + boost.width - 4) {
      ctx.beginPath();
      ctx.moveTo(cx - sign * 5, centerY - 12);
      ctx.lineTo(cx, centerY);
      ctx.lineTo(cx - sign * 5, centerY + 12);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function renderAnchor(
  ctx: CanvasRenderingContext2D,
  anchor: MetallicAnchor,
  elapsedSec: number,
): void {
  ctx.save();

  // Subtle pulsing magnetic field aura
  const pulse = Math.sin(elapsedSec * 3 + anchor.pulsePhase) * 4;
  const aura = ctx.createRadialGradient(
    anchor.x,
    anchor.y,
    anchor.radius * 0.6,
    anchor.x,
    anchor.y,
    anchor.radius + 16 + pulse,
  );
  aura.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
  aura.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, anchor.radius + 16 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Brushed metallic disc
  const discGrad = ctx.createRadialGradient(
    anchor.x - 4,
    anchor.y - 4,
    2,
    anchor.x,
    anchor.y,
    anchor.radius,
  );
  discGrad.addColorStop(0, '#94a3b8');
  discGrad.addColorStop(0.5, '#475569');
  discGrad.addColorStop(1, '#1e293b');

  ctx.fillStyle = discGrad;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 8;

  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, anchor.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Concentric groove ring
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, anchor.radius * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  // Center Core Magnet Indicator
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(anchor.x, anchor.y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderHazardCoil(ctx: CanvasRenderingContext2D, hazard: HazardCoil): void {
  ctx.save();

  // Pulsing danger glow
  const pulse = Math.sin(hazard.glowPhase) * 6;
  const aura = ctx.createRadialGradient(
    hazard.x,
    hazard.y,
    hazard.radius * 0.4,
    hazard.x,
    hazard.y,
    hazard.radius + 18 + pulse,
  );
  aura.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
  aura.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, hazard.radius + 18 + pulse, 0, Math.PI * 2);
  ctx.fill();

  // Base Housing
  ctx.fillStyle = '#262626';
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, hazard.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Electric Coil Rings
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, hazard.radius * 0.6, 0, Math.PI * 2);
  ctx.stroke();

  // Crackling Lightning Arcs
  const arcs = 4;
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < arcs; i++) {
    const angle = hazard.glowPhase + (i * Math.PI * 2) / arcs;
    const innerX = hazard.x + Math.cos(angle) * (hazard.radius * 0.3);
    const innerY = hazard.y + Math.sin(angle) * (hazard.radius * 0.3);
    const midX = hazard.x + Math.cos(angle + 0.3) * (hazard.radius * 0.7);
    const midY = hazard.y + Math.sin(angle + 0.3) * (hazard.radius * 0.7);
    const outerX = hazard.x + Math.cos(angle) * (hazard.radius * 0.95);
    const outerY = hazard.y + Math.sin(angle) * (hazard.radius * 0.95);

    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(midX, midY);
    ctx.lineTo(outerX, outerY);
    ctx.stroke();
  }

  // Center Core
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(hazard.x, hazard.y, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderTractorBeam(
  ctx: CanvasRenderingContext2D,
  player: MagnetPlayer,
  target: { x: number; y: number },
  elapsedSec: number,
): void {
  ctx.save();

  // Main beam glow
  const grad = ctx.createLinearGradient(player.position.x, player.position.y, target.x, target.y);
  grad.addColorStop(0, player.color);
  grad.addColorStop(1, '#38bdf8');

  ctx.strokeStyle = grad;
  ctx.lineWidth = 4;
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(player.position.x, player.position.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Energy pulses traveling along the beam
  const dist = Math.hypot(target.x - player.position.x, target.y - player.position.y);
  const pulseCount = Math.max(2, Math.floor(dist / 40));
  const travel = (elapsedSec * 4) % 1;

  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < pulseCount; i++) {
    const t = (travel + i / pulseCount) % 1;
    const px = player.position.x + (target.x - player.position.x) * t;
    const py = player.position.y + (target.y - player.position.y) * t;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function renderTargetOrb(ctx: CanvasRenderingContext2D, target: TargetOrb): void {
  ctx.save();

  const isStar = target.tier === 'star';
  const isGold = target.tier === 'gold';
  const baseColor = isStar ? '#c084fc' : isGold ? '#fbbf24' : '#38bdf8';
  const glowColor = isStar ? '#a855f7' : isGold ? '#f59e0b' : '#0284c7';

  // Floating bobbing effect
  const bob = Math.sin(target.pulseTimer) * 3;
  const cx = target.x;
  const cy = target.y + bob;

  // Outer radial aura
  const aura = ctx.createRadialGradient(cx, cy, 2, cx, cy, target.radius + 10);
  aura.addColorStop(0, baseColor);
  aura.addColorStop(1, 'transparent');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, target.radius + 10, 0, Math.PI * 2);
  ctx.fill();

  if (isStar) {
    // 4-pointed radiant gem
    ctx.fillStyle = '#f3e8ff';
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    const r = target.radius;
    const ir = r * 0.45;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + target.pulseTimer * 0.5;
      const rad = i % 2 === 0 ? r : ir;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (isGold) {
    // Hexagonal crystal
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + target.pulseTimer * 0.3;
      const x = cx + Math.cos(angle) * target.radius;
      const y = cy + Math.sin(angle) * target.radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Normal Cyan Sphere
    const grad = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, target.radius);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.6, '#38bdf8');
    grad.addColorStop(1, '#0284c7');

    ctx.fillStyle = grad;
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.arc(cx, cy, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function renderShockwave(ctx: CanvasRenderingContext2D, wave: RepelShockwave): void {
  ctx.save();
  const alpha = Math.max(0, wave.life / 0.3);
  ctx.strokeStyle = wave.color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 3;
  ctx.shadowColor = wave.color;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.arc(wave.x, wave.y, wave.currentRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function renderParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  ctx.save();
  const alpha = Math.max(0, p.life / p.maxLife);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;

  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function renderPlayer(
  ctx: CanvasRenderingContext2D,
  player: MagnetPlayer,
  isLocal: boolean,
  _elapsedSec: number,
): void {
  ctx.save();
  const { x, y } = player.position;

  // Stun vibration
  const offsetX = player.stunnedTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
  const offsetY = player.stunnedTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
  const px = x + offsetX;
  const py = y + offsetY;

  // 1. Aim Reticle / Pointer
  const aimDist = 32;
  const aimX = px + Math.cos(player.aimAngle) * aimDist;
  const aimY = py + Math.sin(player.aimAngle) * aimDist;

  ctx.strokeStyle = isLocal ? 'rgba(56, 189, 248, 0.75)' : 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px + Math.cos(player.aimAngle) * 22, py + Math.sin(player.aimAngle) * 22);
  ctx.lineTo(aimX, aimY);
  ctx.stroke();

  // 2. Battery / Energy Ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(px, py, 23, 0, Math.PI * 2);
  ctx.stroke();

  const energyRatio = player.energy / 100;
  const energyColor = energyRatio > 0.4 ? player.color : energyRatio > 0.2 ? '#fbbf24' : '#ef4444';
  ctx.strokeStyle = energyColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(px, py, 23, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * energyRatio);
  ctx.stroke();

  // 3. Magnet Capsule / Body
  ctx.shadowColor = player.color;
  ctx.shadowBlur = isLocal ? 14 : 8;

  // Chassis disc
  const grad = ctx.createRadialGradient(px - 3, py - 3, 2, px, py, 18);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, player.color);
  grad.addColorStop(1, '#090d16');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(px, py, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // North (Red) & South (Blue) Pole Accent Bars
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(player.aimAngle);

  // North pole indicator
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(8, -5, 6, 10);

  // South pole indicator
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(-14, -5, 6, 10);
  ctx.restore();

  // Stunned indicator
  if (player.stunnedTimer > 0) {
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡STUNNED⚡', px, py - 30);
  } else {
    // Player Name & Score Badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 1;

    const label = `${player.name} (${player.score})`;
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    const textWidth = ctx.measureText(label).width;

    ctx.fillRect(px - textWidth / 2 - 6, py - 38, textWidth + 12, 16);
    ctx.strokeRect(px - textWidth / 2 - 6, py - 38, textWidth + 12, 16);

    ctx.fillStyle = '#f8fafc';
    ctx.fillText(label, px, py - 26);
  }

  ctx.restore();
}

function renderFloatingText(
  ctx: CanvasRenderingContext2D,
  ft: { text: string; x: number; y: number; color: string; life: number; maxLife: number },
): void {
  ctx.save();
  const alpha = Math.max(0, ft.life / ft.maxLife);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ft.color;
  ctx.shadowColor = ft.color;
  ctx.shadowBlur = 6;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(ft.text, ft.x, ft.y);
  ctx.restore();
}

function renderCountdown(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  countdownSec: number,
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, width, height);

  const num = Math.ceil(countdownSec);
  const text = num > 0 ? `${num}` : 'GO!';

  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 24;
  ctx.font = 'bold 72px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  ctx.restore();
}
