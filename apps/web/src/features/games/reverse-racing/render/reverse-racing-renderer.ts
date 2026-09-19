import { OBSTACLE_CONFIG, validateObstaclePlacement } from '../engine/obstacle-system';
import type {
  Lane,
  Obstacle,
  RacingPlayer,
  SaboteurState,
  VehicleState,
} from '../types/reverse-racing.types';

export interface RenderOptions {
  highContrast?: boolean;
  reducedMotion?: boolean;
  hoverLane?: Lane | null;
  hoverDistance?: number | null;
}

export class ReverseRacingRenderer {
  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    localVehicle: VehicleState,
    localTrackObstacles: Obstacle[],
    targetVehicle: VehicleState | null,
    targetTrackObstacles: Obstacle[],
    saboteur: SaboteurState,
    allPlayers: RacingPlayer[],
    options: RenderOptions = {},
  ): void {
    ctx.clearRect(0, 0, width, height);

    // Dark cyberpunk asphalt background
    ctx.fillStyle = options.highContrast ? '#05070d' : '#080d1a';
    ctx.fillRect(0, 0, width, height);

    // We split into two primary views:
    // Left: Racer View (approx 58% width) - 3D pseudo-perspective arcade racer
    // Right: Saboteur Radar / Tactical Monitor (approx 42% width) - Top-down interactive obstacle placement grid
    const racerWidth = Math.floor(width * 0.58);
    const saboteurX = racerWidth + 8;
    const saboteurWidth = width - saboteurX;

    this.renderRacerView(ctx, 0, 0, racerWidth, height, localVehicle, localTrackObstacles, options);
    this.renderDivider(ctx, racerWidth, height);
    this.renderSaboteurView(
      ctx,
      saboteurX,
      0,
      saboteurWidth,
      height,
      targetVehicle,
      targetTrackObstacles,
      saboteur,
      options,
    );
  }

  private renderDivider(ctx: CanvasRenderingContext2D, x: number, height: number): void {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 4, 0);
    ctx.lineTo(x + 4, height);
    ctx.stroke();

    // Subtle neon divider glow
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 4, 0);
    ctx.lineTo(x + 4, height);
    ctx.stroke();
  }

  /**
   * Renders the Player's Racer View (Third-Person Arcade Perspective)
   */
  private renderRacerView(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    vehicle: VehicleState,
    obstacles: Obstacle[],
    options: RenderOptions,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // Horizon sky gradient
    const skyGrad = ctx.createLinearGradient(x, y, x, y + h * 0.35);
    skyGrad.addColorStop(0, '#0a0f1d');
    skyGrad.addColorStop(1, '#131e36');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(x, y, w, h * 0.35);

    // Distant city skyline or neon grid
    const horizonY = y + h * 0.35;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, horizonY);
    ctx.lineTo(x + w, horizonY);
    ctx.stroke();

    // Track surface
    const trackTopW = w * 0.25;
    const trackBottomW = w * 0.85;
    const trackTopX = x + (w - trackTopW) / 2;
    const trackBottomX = x + (w - trackBottomW) / 2;

    const roadGrad = ctx.createLinearGradient(x, horizonY, x, y + h);
    roadGrad.addColorStop(0, '#111827');
    roadGrad.addColorStop(1, '#1a2234');
    ctx.fillStyle = roadGrad;

    ctx.beginPath();
    ctx.moveTo(trackTopX, horizonY);
    ctx.lineTo(trackTopX + trackTopW, horizonY);
    ctx.lineTo(trackBottomX + trackBottomW, y + h);
    ctx.lineTo(trackBottomX, y + h);
    ctx.closePath();
    ctx.fill();

    // Track borders
    ctx.strokeStyle = options.highContrast ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(trackTopX, horizonY);
    ctx.lineTo(trackBottomX, y + h);
    ctx.moveTo(trackTopX + trackTopW, horizonY);
    ctx.lineTo(trackBottomX + trackBottomW, y + h);
    ctx.stroke();

    // Lane dividers (-1, 0, 1) -> 2 divider lines
    for (let laneDiv = 1; laneDiv <= 2; laneDiv++) {
      const topDivX = trackTopX + (trackTopW / 3) * laneDiv;
      const botDivX = trackBottomX + (trackBottomW / 3) * laneDiv;

      ctx.save();
      ctx.setLineDash([12, 16]);
      const dashOffset = -(vehicle.distance * 10) % 28;
      ctx.lineDashOffset = options.reducedMotion ? 0 : dashOffset;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(topDivX, horizonY);
      ctx.lineTo(botDivX, y + h);
      ctx.stroke();
      ctx.restore();
    }

    // Render obstacles on track within visible distance (up to 120m ahead)
    const visibleObstacles = obstacles.filter(
      (obs) =>
        obs.active &&
        obs.distance >= vehicle.distance - 5 &&
        obs.distance <= vehicle.distance + 110,
    );

    // Sort far-to-near for correct depth painter's algorithm
    visibleObstacles.sort((a, b) => b.distance - a.distance);

    for (const obs of visibleObstacles) {
      this.renderPerspectiveObstacle(
        ctx,
        obs,
        vehicle.distance,
        horizonY,
        y + h,
        trackTopX,
        trackTopW,
        trackBottomX,
        trackBottomW,
      );
    }

    // Render local vehicle
    this.renderPerspectiveVehicle(
      ctx,
      vehicle,
      horizonY,
      y + h,
      trackTopX,
      trackTopW,
      trackBottomX,
      trackBottomW,
    );

    // Speed & Crash Overlay
    if (vehicle.status === 'crashed') {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CRASHED! RECOVERING...', x + w / 2, y + h * 0.45);
    } else if (vehicle.slideTimer > 0) {
      ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OIL SLICK! NO TRACTION', x + w / 2, y + h * 0.45);
    }

    // Header label
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('YOUR RACER (DRIVE: A/D or ARROWS, JUMP: SPACE/W)', x + 16, y + 24);

    ctx.restore();
  }

  private renderPerspectiveVehicle(
    ctx: CanvasRenderingContext2D,
    vehicle: VehicleState,
    horizonY: number,
    bottomY: number,
    topX: number,
    topW: number,
    botX: number,
    botW: number,
  ): void {
    // Car sits near bottom of screen, at ~85% vertical progress
    const t = 0.85;
    const currentTrackY = horizonY + (bottomY - horizonY) * t;
    const currentTrackW = topW + (botW - topW) * t;
    const currentTrackX = topX + (botX - topX) * t;

    // Lateral position based on vehicle.lateralProgress (-1 to 1)
    // Lane center offsets: lane -1 is at 1/6, lane 0 is at 3/6, lane 1 is at 5/6
    const laneFraction = (vehicle.lateralProgress + 1) / 2; // 0 to 1
    const carCenterX = currentTrackX + currentTrackW * (0.166 + laneFraction * 0.668);

    // Jump vertical displacement
    const jumpPixelOffset = vehicle.jumpHeight * 30;
    const carY = currentTrackY - jumpPixelOffset;

    const carW = 54;
    const carH = 32;

    // Shadow on road
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(
      carCenterX,
      currentTrackY + 8,
      carW * 0.55,
      10 / (1 + vehicle.jumpHeight * 0.4),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Car chassis body
    ctx.save();
    ctx.translate(carCenterX, carY);

    // Roll tilt during steering
    const roll = (vehicle.targetLane - vehicle.lateralProgress) * 0.15;
    ctx.rotate(roll);

    // Vehicle main body
    ctx.fillStyle = vehicle.color || '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(-carW / 2, -carH / 2, carW, carH, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Cockpit / Windshield
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-carW * 0.3, -carH * 0.35, carW * 0.6, carH * 0.4, 3);
    ctx.fill();

    // Neon taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-carW * 0.45, carH * 0.3, 10, 4);
    ctx.fillRect(carW * 0.45 - 10, carH * 0.3, 10, 4);

    // Exhaust thrust flame
    if (vehicle.status === 'driving' || vehicle.status === 'jumping') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(-8, carH * 0.4);
      ctx.lineTo(0, carH * 0.4 + 14 + Math.random() * 8);
      ctx.lineTo(8, carH * 0.4);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderPerspectiveObstacle(
    ctx: CanvasRenderingContext2D,
    obs: Obstacle,
    playerDist: number,
    horizonY: number,
    bottomY: number,
    topX: number,
    topW: number,
    botX: number,
    botW: number,
  ): void {
    const relativeDist = obs.distance - playerDist;
    if (relativeDist <= 0 || relativeDist > 110) return;

    // Depth interpolation: closer objects scale quadratically
    const depthT = Math.max(0, Math.min(1, 1 - relativeDist / 110));
    const t = Math.pow(depthT, 1.8);

    const obsY = horizonY + (bottomY - horizonY) * t;
    const currentTrackW = topW + (botW - topW) * t;
    const currentTrackX = topX + (botX - topX) * t;

    // Lane fraction
    const laneFraction = (obs.lane + 1) / 2;
    const obsX = currentTrackX + currentTrackW * (0.166 + laneFraction * 0.668);

    const scale = 0.2 + t * 0.9;
    const size = 36 * scale;

    ctx.save();
    ctx.translate(obsX, obsY);

    if (obs.type === 'roadblock') {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-size / 2, -size * 0.6, size, size * 0.6);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(-size / 2, -size * 0.6, size, size * 0.6);
    } else if (obs.type === 'oil-slick') {
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.7, size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (obs.type === 'speed-bump') {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-size * 0.6, -size * 0.2, size * 1.2, size * 0.4);
    } else if (obs.type === 'boost-pad') {
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, size * 0.3);
      ctx.lineTo(0, -size * 0.5);
      ctx.lineTo(size * 0.5, size * 0.3);
      ctx.closePath();
      ctx.fill();
    } else {
      // generic barrier
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-size / 2, -size * 0.5, size, size * 0.5);
    }

    ctx.restore();
  }

  /**
   * Renders the Saboteur Tactical Monitor (Interactive Overhead View of Target's Track)
   */
  private renderSaboteurView(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    targetVehicle: VehicleState | null,
    targetObstacles: Obstacle[],
    saboteur: SaboteurState,
    options: RenderOptions,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();

    // Tactical dark grid background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(x, y, w, h);

    // Header label & target status
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('SABOTEUR RADAR (CLICK TRACK TO DROP OBSTACLE)', x + 16, y + 24);

    if (!targetVehicle) {
      ctx.fillStyle = '#64748b';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NO TARGET ASSIGNED (SOLO MODE)', x + w / 2, y + h / 2);
      ctx.restore();
      return;
    }

    // Overhead Track Area
    const trackMarginX = 36;
    const trackW = w - trackMarginX * 2;
    const trackY = y + 56;
    const trackH = h - 76;

    // Track bounds (vertical scrolling window around target vehicle)
    // Target vehicle is kept around 25% from bottom of tactical radar
    const viewMeters = 100; // view shows 100m window
    const targetDist = targetVehicle.distance;
    const viewStartDist = Math.max(0, targetDist - 20);
    const viewEndDist = viewStartDist + viewMeters;

    // Draw 3 lanes
    const laneW = trackW / 3;
    for (let i = 0; i < 3; i++) {
      const laneX = x + trackMarginX + i * laneW;
      ctx.fillStyle = i % 2 === 0 ? '#111827' : '#141d2e';
      ctx.fillRect(laneX, trackY, laneW, trackH);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(laneX, trackY, laneW, trackH);
    }

    // Reaction danger zone (targetDist to targetDist + 18m) -> Red shaded area (too close to place)
    const dangerStartMeter = targetDist;
    const dangerEndMeter = targetDist + 18;
    const dangerStartY =
      trackY + trackH - ((dangerStartMeter - viewStartDist) / viewMeters) * trackH;
    const dangerEndY = trackY + trackH - ((dangerEndMeter - viewStartDist) / viewMeters) * trackH;

    if (dangerStartY > trackY && dangerEndY < trackY + trackH) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.fillRect(
        x + trackMarginX,
        Math.max(trackY, dangerEndY),
        trackW,
        Math.min(trackH, dangerStartY - dangerEndY),
      );
    }

    // Draw existing obstacles on target's track
    for (const obs of targetObstacles) {
      if (!obs.active) continue;
      if (obs.distance >= viewStartDist && obs.distance <= viewEndDist) {
        const obsT = (obs.distance - viewStartDist) / viewMeters;
        const obsY = trackY + trackH - obsT * trackH;
        const laneIndex = obs.lane + 1; // 0, 1, 2
        const obsX = x + trackMarginX + laneIndex * laneW + laneW / 2;

        const cfg = OBSTACLE_CONFIG[obs.type];
        ctx.fillStyle = obs.type === 'roadblock' ? '#f43f5e' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(obsX, obsY, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(cfg.icon, obsX, obsY);
      }
    }

    // Draw Target Vehicle on radar
    const targetT = (targetDist - viewStartDist) / viewMeters;
    const targetCarY = trackY + trackH - targetT * trackH;
    const targetLaneIndex = targetVehicle.lane + 1;
    const targetCarX = x + trackMarginX + targetLaneIndex * laneW + laneW / 2;

    ctx.fillStyle = targetVehicle.color || '#ef4444';
    ctx.beginPath();
    ctx.roundRect(targetCarX - 14, targetCarY - 20, 28, 40, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET', targetCarX, targetCarY - 24);

    // Interactive placement hover cursor
    if (
      options.hoverLane !== null &&
      options.hoverDistance !== null &&
      options.hoverDistance !== undefined &&
      options.hoverLane !== undefined
    ) {
      const hoverMeter = options.hoverDistance;
      if (hoverMeter >= viewStartDist && hoverMeter <= viewEndDist) {
        const hoverT = (hoverMeter - viewStartDist) / viewMeters;
        const hoverY = trackY + trackH - hoverT * trackH;
        const hoverLaneIdx = options.hoverLane + 1;
        const hoverX = x + trackMarginX + hoverLaneIdx * laneW + laneW / 2;

        const validation = validateObstaclePlacement(
          hoverMeter,
          options.hoverLane,
          saboteur.selectedObstacle,
          targetDist,
          targetObstacles,
        );

        ctx.strokeStyle = validation.valid ? '#10b981' : '#ef4444';
        ctx.fillStyle = validation.valid ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hoverX, hoverY, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const cfg = OBSTACLE_CONFIG[saboteur.selectedObstacle];
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cfg.icon, hoverX, hoverY);
      }
    }

    ctx.restore();
  }
}
