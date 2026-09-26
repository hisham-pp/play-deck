'use client';

import React, { useEffect, useRef } from 'react';
import type { FisherPlayer, FishingLocation } from '../engine/fishing-competition-engine';

interface FishingWaterCanvasProps {
  location: FishingLocation;
  player: FisherPlayer;
  isReeling: boolean;
}

export function FishingWaterCanvas({ location, player, isReeling }: FishingWaterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let waveOffset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Sky & Horizon Gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.45);
      if (location.id === 'night') {
        skyGradient.addColorStop(0, '#090d16');
        skyGradient.addColorStop(1, '#1e1b4b');
      } else if (location.id === 'swamp') {
        skyGradient.addColorStop(0, '#064e3b');
        skyGradient.addColorStop(1, '#065f46');
      } else if (location.id === 'ocean') {
        skyGradient.addColorStop(0, '#0284c7');
        skyGradient.addColorStop(1, '#0369a1');
      } else {
        skyGradient.addColorStop(0, '#38bdf8');
        skyGradient.addColorStop(1, '#0284c7');
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height * 0.45);

      // Distant mountains / shoreline silhouette
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width * 0.2, height * 0.35);
      ctx.lineTo(width * 0.45, height * 0.42);
      ctx.lineTo(width * 0.7, height * 0.32);
      ctx.lineTo(width, height * 0.45);
      ctx.closePath();
      ctx.fill();

      // 2. Water Gradient
      const waterGradient = ctx.createLinearGradient(0, height * 0.45, 0, height);
      waterGradient.addColorStop(0, location.ambientColor);
      waterGradient.addColorStop(1, location.waterColor);
      ctx.fillStyle = waterGradient;
      ctx.fillRect(0, height * 0.45, width, height * 0.55);

      // 3. Dynamic Animated Waves
      waveOffset += 0.035;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;

      for (let layer = 0; layer < 4; layer++) {
        const yBase = height * (0.5 + layer * 0.12);
        ctx.beginPath();
        for (let x = 0; x <= width; x += 15) {
          const y = yBase + Math.sin(x * 0.015 + waveOffset + layer * 1.5) * (4 + layer * 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // 4. Pier / Fishing Rod Base (Bottom Left)
      const rodOriginX = width * 0.12;
      const rodOriginY = height * 0.95;
      const rodTipX = width * 0.32;
      const rodTipY = height * 0.42 + (isReeling ? Math.sin(waveOffset * 8) * 8 : 0);

      // Wooden Deck Pier
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, height * 0.88, width * 0.2, height * 0.12);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, height * 0.88, width * 0.2, 4);

      // Fishing Rod
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rodOriginX, rodOriginY);
      // Slight bend curve when reeling
      const controlX = (rodOriginX + rodTipX) / 2;
      const controlY = rodOriginY - (isReeling ? 60 : 40);
      ctx.quadraticCurveTo(controlX, controlY, rodTipX, rodTipY);
      ctx.stroke();

      // 5. Fishing Line & Bobber
      const hasActiveLine =
        player.status === 'waiting_for_bite' ||
        player.status === 'bite_active' ||
        player.status === 'reeling';

      if (hasActiveLine) {
        // Bobber target coordinate based on cast power
        const bobberX = width * (0.45 + (player.castPower / 100) * 0.42);
        const bobberWave = Math.sin(waveOffset * 3) * 3;
        let bobberY = height * 0.65 + bobberWave;

        // If bite active, bobber plunges vigorously!
        if (player.status === 'bite_active') {
          bobberY += Math.sin(waveOffset * 18) * 12 + 8;
        }

        // Line from rod tip to bobber
        ctx.strokeStyle = player.lineTension > 80 ? '#ef4444' : 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = player.lineTension > 80 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(rodTipX, rodTipY);
        // Curve sag or tension straight line
        const sag = isReeling ? (100 - player.lineTension) * 0.15 : 20;
        ctx.quadraticCurveTo(
          (rodTipX + bobberX) / 2,
          Math.min(rodTipY, bobberY) + sag,
          bobberX,
          bobberY,
        );
        ctx.stroke();

        // Water Ripples around bobber
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const rippleR = 8 + (Math.sin(waveOffset * 4) + 1) * 6;
        ctx.ellipse(bobberX, bobberY + 4, rippleR, rippleR * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Bobber (Red/White float)
        ctx.fillStyle = '#ef4444'; // Red top
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, 6, Math.PI, 0, false);
        ctx.fill();
        ctx.fillStyle = '#ffffff'; // White bottom
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, 6, 0, Math.PI, false);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bobberX, bobberY, 6, 0, Math.PI * 2);
        ctx.stroke();

        // 6. Visual Bite Flash & Exclamation
        if (player.status === 'bite_active') {
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 24px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('❗ BITE!', bobberX, bobberY - 20);

          // Splash ring
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          const splashR = 16 + (Math.sin(waveOffset * 10) + 1) * 8;
          ctx.ellipse(bobberX, bobberY + 4, splashR, splashR * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 7. Underwater Fish Struggle (during Reeling)
        if (player.status === 'reeling') {
          const fishX = bobberX + Math.sin(waveOffset * 6) * 25;
          const fishY = bobberY + 24;

          // Fish shadow silhouette under water
          ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
          ctx.beginPath();
          ctx.ellipse(fishX, fishY, 14, 6, waveOffset, 0, Math.PI * 2);
          ctx.fill();

          // Bubble spray particles
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          for (let b = 0; b < 3; b++) {
            const bx = fishX + (b - 1) * 12 + Math.sin(waveOffset * 8 + b) * 5;
            const by = fishY - b * 6;
            ctx.beginPath();
            ctx.arc(bx, by, 2 + b, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [location, player, isReeling]);

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950">
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-full block" />
    </div>
  );
}
