import type {
  BrainCharacterState,
  CourseDefinition,
  PlayerPair,
} from '../types/shared-brain.types';

export interface CameraState {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

export class SharedBrainRenderer {
  private ctx: CanvasRenderingContext2D;
  private animTick = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    course: CourseDefinition,
    pairs: PlayerPair[],
    focusedPairId: string | null,
    collectedTokenIds: Set<string>,
    activeSwitchIds: Set<string>,
    doorStates: Map<string, number>, // doorId -> openness 0 (closed) to 1 (fully open)
  ): void {
    this.animTick += 1;
    const ctx = this.ctx;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Determine camera focus
    const focusedPair = pairs.find((p) => p.pairId === focusedPairId) || pairs[0];
    const targetX = focusedPair
      ? focusedPair.character.position.x + focusedPair.character.width / 2
      : 400;
    const targetY = focusedPair
      ? focusedPair.character.position.y + focusedPair.character.height / 2
      : 300;

    // Smooth camera bounds
    const worldW = course.worldBounds?.width || 2000;
    const worldH = course.worldBounds?.height || 600;
    const cameraX = Math.max(0, Math.min(targetX - width / 2, worldW - width));
    const cameraY = Math.max(0, Math.min(targetY - height / 2, worldH - height));

    ctx.save();
    // Clear screen
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Render background grid & neural synpase effects
    this.renderNeuralBackground(width, height, cameraX, cameraY);

    // Apply camera transform for world objects
    ctx.translate(-cameraX, -cameraY);

    // Render elements (platforms, hazards, bounce pads, doors, switches, tokens, goal)
    this.renderElements(course, collectedTokenIds, activeSwitchIds, doorStates);

    // Render Goal Portal
    const goalEl = course.elements.find((e) => e.type === 'goal');
    if (goalEl) {
      this.renderGoalPortal(goalEl.x, goalEl.y);
    }

    // Render all characters/pairs
    for (const pair of pairs) {
      this.renderCharacter(
        pair.character,
        pair.colorA,
        pair.colorB,
        pair.pairId,
        pair.navigatorName,
        pair.motorName,
      );
    }

    ctx.restore();
  }

  private renderNeuralBackground(viewW: number, viewH: number, camX: number, camY: number): void {
    const ctx = this.ctx;
    const gridSize = 60;
    const offsetX = -(camX * 0.3) % gridSize;
    const offsetY = -(camY * 0.3) % gridSize;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = offsetX; x < viewW; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, viewH);
    }
    for (let y = offsetY; y < viewH; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(viewW, y);
    }
    ctx.stroke();

    // Subtle background pulses
    const pulseRadius = 150 + Math.sin(this.animTick * 0.04) * 20;
    const grad = ctx.createRadialGradient(
      viewW / 2,
      viewH / 2,
      10,
      viewW / 2,
      viewH / 2,
      pulseRadius * 2,
    );
    grad.addColorStop(0, 'rgba(139, 92, 246, 0.06)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  private renderElements(
    course: CourseDefinition,
    collectedTokenIds: Set<string>,
    activeSwitchIds: Set<string>,
    doorStates: Map<string, number>,
  ): void {
    const ctx = this.ctx;

    for (const el of course.elements) {
      switch (el.type) {
        case 'platform': {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, 6);
          ctx.fill();
          ctx.stroke();

          // Top highlight line
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(el.x + 4, el.y, el.width - 8, 3);
          break;
        }

        case 'laser-gate': {
          // Pulsing red hazard spikes
          const pulse = (Math.sin(this.animTick * 0.1) + 1) * 0.5;
          ctx.fillStyle = `rgba(239, 68, 68, ${0.7 + pulse * 0.3})`;
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 1.5;

          const numSpikes = Math.max(1, Math.floor(el.width / 16));
          const spikeW = el.width / numSpikes;

          ctx.beginPath();
          ctx.moveTo(el.x, el.y + el.height);
          for (let i = 0; i < numSpikes; i++) {
            const sx = el.x + i * spikeW;
            ctx.lineTo(sx + spikeW / 2, el.y);
            ctx.lineTo(sx + spikeW, el.y + el.height);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'bouncy-pad': {
          // Spring pad with glowing arrows
          ctx.fillStyle = '#eab308';
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, 4);
          ctx.fill();
          ctx.stroke();

          // Arrow chevron
          const bounceOffset = Math.sin(this.animTick * 0.15) * 3;
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(el.x + el.width / 2 - 8, el.y + el.height / 2 + 3 + bounceOffset);
          ctx.lineTo(el.x + el.width / 2, el.y + el.height / 2 - 5 + bounceOffset);
          ctx.lineTo(el.x + el.width / 2 + 8, el.y + el.height / 2 + 3 + bounceOffset);
          ctx.stroke();
          break;
        }

        case 'switch-lever': {
          const isActive = activeSwitchIds.has(el.id);
          // Base pedestal
          ctx.fillStyle = '#334155';
          ctx.fillRect(el.x, el.y + el.height - 8, el.width, 8);

          // Lever / button
          ctx.fillStyle = isActive ? '#22c55e' : '#ef4444';
          ctx.beginPath();
          ctx.arc(el.x + el.width / 2, el.y + 10, 8, 0, Math.PI * 2);
          ctx.fill();

          // Lever stem
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(el.x + el.width / 2, el.y + el.height - 8);
          ctx.lineTo(el.x + el.width / 2, el.y + 10);
          ctx.stroke();

          // Glow if active
          if (isActive) {
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#4ade80';
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          break;
        }

        case 'door': {
          const openness = doorStates.get(el.id) ?? 0;
          if (openness >= 0.95) break; // Door retracted

          const remainingHeight = el.height * (1 - openness);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.fillRect(el.x, el.y, el.width, remainingHeight);
          ctx.strokeRect(el.x, el.y, el.width, remainingHeight);

          // Barrier energy scanlines
          ctx.strokeStyle = 'rgba(254, 202, 202, 0.6)';
          ctx.lineWidth = 1;
          for (let ly = el.y + 6; ly < el.y + remainingHeight; ly += 12) {
            ctx.beginPath();
            ctx.moveTo(el.x + 2, ly);
            ctx.lineTo(el.x + el.width - 2, ly);
            ctx.stroke();
          }
          break;
        }

        case 'token': {
          if (collectedTokenIds.has(el.id)) break;

          const floatY = Math.sin(this.animTick * 0.08 + el.x) * 6;
          const cx = el.x + el.width / 2;
          const cy = el.y + el.height / 2 + floatY;

          // Brain icon / golden orb glow
          ctx.save();
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#78350f';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🧠', cx, cy);
          ctx.restore();
          break;
        }
      }
    }
  }

  private renderGoalPortal(gx: number, gy: number): void {
    const ctx = this.ctx;
    const cx = gx + 20;
    const cy = gy + 30;
    const rot = this.animTick * 0.04;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Outer swirling galaxy
    ctx.shadowColor = '#8b5cf6';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16, Math.PI, Math.PI * 2.5);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // "GOAL" label above
    ctx.fillStyle = '#c4b5fd';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', cx, cy - 35);
  }

  private renderCharacter(
    char: BrainCharacterState,
    colorA: string,
    colorB: string,
    pairId: string,
    navName: string,
    motName: string,
  ): void {
    const ctx = this.ctx;
    const cx = char.position.x + char.width / 2;
    const cy = char.position.y + char.height / 2;

    ctx.save();
    // Squash & stretch based on vertical velocity
    let scaleX = 1;
    let scaleY = 1;
    if (Math.abs(char.velocity.y) > 100) {
      scaleX = 0.85;
      scaleY = 1.15;
    } else if (char.isGrounded && Math.abs(char.velocity.x) > 10) {
      const stepBounce = Math.sin(this.animTick * 0.25) * 0.05;
      scaleX = 1 + stepBounce;
      scaleY = 1 - stepBounce;
    }

    ctx.translate(cx, cy);
    ctx.scale(scaleX, scaleY);

    const r = char.width / 2;

    // Dual-hemisphere brain body
    // Left Hemisphere (Navigator - colorA)
    ctx.fillStyle = colorA;
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI * 0.5, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();

    // Right Hemisphere (Motor - colorB)
    ctx.fillStyle = colorB;
    ctx.beginPath();
    ctx.arc(0, 0, r, Math.PI * 1.5, Math.PI * 0.5);
    ctx.closePath();
    ctx.fill();

    // Dividing fissure
    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(0, r);
    ctx.stroke();

    // Eyes
    const lookDir = char.facing === 'right' ? 3 : -3;
    ctx.fillStyle = '#ffffff';
    // Left eye
    ctx.beginPath();
    ctx.arc(-7 + lookDir, -3, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.arc(7 + lookDir, -3, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-7 + lookDir * 1.4, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7 + lookDir * 1.4, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Player tags above character
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    // Pair ID label
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${pairId.toUpperCase()}`, cx, char.position.y - 20);

    // Nav & Motor labels
    const tagText = `🧭 ${navName} | 🕹️ ${motName}`;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(tagText, cx, char.position.y - 8);
  }
}
