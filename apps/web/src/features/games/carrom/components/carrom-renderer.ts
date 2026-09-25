import type { CarromPiece, CarromState } from '../engine/carrom-engine';

/**
 * High-performance 2D Canvas renderer for the Carrom board, pieces, cushions, and trajectory line.
 */
export function renderCarromBoard(
  ctx: CanvasRenderingContext2D,
  state: CarromState,
  aimAngleDeg: number,
  aimPower: number,
) {
  const size = state.config.boardSize;
  const border = state.config.innerBorder;
  const center = size / 2;

  ctx.clearRect(0, 0, size, size);

  // 1. Outer Dark Mahogany Wood Frame
  const frameGrad = ctx.createLinearGradient(0, 0, size, size);
  frameGrad.addColorStop(0, '#2d180b');
  frameGrad.addColorStop(0.5, '#1e0e06');
  frameGrad.addColorStop(1, '#170a04');
  ctx.fillStyle = frameGrad;
  ctx.fillRect(0, 0, size, size);

  // Outer Frame Bevel
  ctx.strokeStyle = '#5a2e12';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  // 2. Lacquered Birch Plywood Playing Surface
  const surfaceGrad = ctx.createRadialGradient(center, center, 40, center, center, size * 0.55);
  surfaceGrad.addColorStop(0, '#e5be88');
  surfaceGrad.addColorStop(0.8, '#d6a86c');
  surfaceGrad.addColorStop(1, '#c59556');
  ctx.fillStyle = surfaceGrad;
  ctx.fillRect(border, border, size - border * 2, size - border * 2);

  // Inner Cushion Bumper Shadow
  ctx.strokeStyle = '#3a1f0e';
  ctx.lineWidth = 6;
  ctx.strokeRect(border, border, size - border * 2, size - border * 2);

  // 3. Four Corner Pockets (Cast shadow & metal rim)
  for (const pocket of state.pockets) {
    // Metal outer rim
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();

    // Recessed dark pocket hole
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocket.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#060911';
    ctx.fill();
    ctx.strokeStyle = '#020408';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 4. Carrom Markings: Center Circles, Concentric Rings & Lines
  // Center Queen Circle
  ctx.beginPath();
  ctx.arc(center, center, 38, 0, Math.PI * 2);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Center Inner Red Accent
  ctx.beginPath();
  ctx.arc(center, center, 14, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Outer Center Ring
  ctx.beginPath();
  ctx.arc(center, center, 115, 0, Math.PI * 2);
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 5. Baselines (Top & Bottom)
  const drawBaseline = (y: number, minX: number, maxX: number) => {
    // Twin lines
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(minX, y - 8);
    ctx.lineTo(maxX, y - 8);
    ctx.moveTo(minX, y + 8);
    ctx.lineTo(maxX, y + 8);
    ctx.stroke();

    // End Red Circles
    [minX, maxX].forEach((cx) => {
      ctx.beginPath();
      ctx.arc(cx, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  drawBaseline(state.baseline.player1Y, state.baseline.minX, state.baseline.maxX);
  drawBaseline(state.baseline.player2Y, state.baseline.minX, state.baseline.maxX);

  // 6. Corner Diagonal Arrows pointing to pockets
  for (const pocket of state.pockets) {
    const dx = center - pocket.x;
    const dy = center - pocket.y;
    const angle = Math.atan2(dy, dx);
    const startX = pocket.x + Math.cos(angle) * 75;
    const startY = pocket.y + Math.sin(angle) * 75;
    const endX = startX + Math.cos(angle) * 90;
    const endY = startY + Math.sin(angle) * 90;

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Decorative circle along line
    ctx.beginPath();
    ctx.arc(startX + Math.cos(angle) * 45, startY + Math.sin(angle) * 45, 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 7. Aim Trajectory Line when aiming
  if (state.phase === 'positioning' || state.phase === 'aiming') {
    const angleRad =
      state.activePlayer === 'player1'
        ? (-aimAngleDeg * Math.PI) / 180
        : (aimAngleDeg * Math.PI) / 180;

    const length = 50 + (aimPower / 100) * 180;
    const endX = state.striker.x + Math.cos(angleRad) * length;
    const endY = state.striker.y + Math.sin(angleRad) * length;

    // Laser / Dotted Guide Line
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(state.striker.x, state.striker.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Aim tip target circle
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.restore();
  }

  // 8. Render Coins
  for (const coin of state.coins) {
    if (coin.isPocketed) continue;
    drawPiece(ctx, coin);
  }

  // 9. Render Striker
  if (!state.striker.isPocketed) {
    drawStriker(ctx, state.striker, state.activePlayer);
  }
}

/**
 * Draws an individual carrom piece (White, Black, or Queen) with realistic shading.
 */
function drawPiece(ctx: CanvasRenderingContext2D, piece: CarromPiece) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 3;

  ctx.beginPath();
  ctx.arc(piece.x, piece.y, piece.radius, 0, Math.PI * 2);

  if (piece.type === 'queen') {
    // Red Queen
    const grad = ctx.createRadialGradient(
      piece.x - 4,
      piece.y - 4,
      2,
      piece.x,
      piece.y,
      piece.radius,
    );
    grad.addColorStop(0, '#f87171');
    grad.addColorStop(0.7, '#dc2626');
    grad.addColorStop(1, '#991b1b');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Central Gold Star
    ctx.beginPath();
    ctx.arc(piece.x, piece.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();
  } else if (piece.type === 'white') {
    // White/Ivory Coin
    const grad = ctx.createRadialGradient(
      piece.x - 4,
      piece.y - 4,
      2,
      piece.x,
      piece.y,
      piece.radius,
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.7, '#f1f5f9');
    grad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric ring grooves
    ctx.beginPath();
    ctx.arc(piece.x, piece.y, piece.radius * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  } else {
    // Black/Ebony Coin
    const grad = ctx.createRadialGradient(
      piece.x - 4,
      piece.y - 4,
      2,
      piece.x,
      piece.y,
      piece.radius,
    );
    grad.addColorStop(0, '#334155');
    grad.addColorStop(0.7, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Concentric ring grooves
    ctx.beginPath();
    ctx.arc(piece.x, piece.y, piece.radius * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws the heavy arcade striker piece.
 */
function drawStriker(
  ctx: CanvasRenderingContext2D,
  striker: CarromPiece,
  activePlayer: 'player1' | 'player2',
) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;

  ctx.beginPath();
  ctx.arc(striker.x, striker.y, striker.radius, 0, Math.PI * 2);

  // Acrylic translucent sheen
  const grad = ctx.createRadialGradient(
    striker.x - 5,
    striker.y - 5,
    3,
    striker.x,
    striker.y,
    striker.radius,
  );
  if (activePlayer === 'player1') {
    grad.addColorStop(0, '#fef3c7');
    grad.addColorStop(0.6, '#fde68a');
    grad.addColorStop(1, '#d97706');
  } else {
    grad.addColorStop(0, '#e0e7ff');
    grad.addColorStop(0.6, '#c7d2fe');
    grad.addColorStop(1, '#4f46e5');
  }
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = activePlayer === 'player1' ? '#f59e0b' : '#6366f1';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Striker Inner Carved Floral Star Pattern
  ctx.beginPath();
  ctx.arc(striker.x, striker.y, striker.radius * 0.55, 0, Math.PI * 2);
  ctx.strokeStyle = activePlayer === 'player1' ? '#b45309' : '#4338ca';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(striker.x, striker.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = activePlayer === 'player1' ? '#b45309' : '#4338ca';
  ctx.fill();

  ctx.restore();
}
