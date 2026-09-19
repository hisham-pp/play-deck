'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ReverseRacingRenderer } from '../render/reverse-racing-renderer';
import type {
  Lane,
  Obstacle,
  ObstacleType,
  RacingPlayer,
  SaboteurState,
  VehicleState,
} from '../types/reverse-racing.types';

interface ReverseRacingCanvasProps {
  localVehicle: VehicleState;
  localTrackObstacles: Obstacle[];
  targetVehicle: VehicleState | null;
  targetTrackObstacles: Obstacle[];
  saboteur: SaboteurState;
  allPlayers: RacingPlayer[];
  highContrast: boolean;
  reducedMotion: boolean;
  onSteerLeft: () => void;
  onSteerRight: () => void;
  onJump: () => void;
  onBrake: (dt: number) => void;
  onSelectObstacle: (type: ObstacleType) => void;
  onPlaceObstacle: (distance: number, lane: Lane) => void;
}

export function ReverseRacingCanvas({
  localVehicle,
  localTrackObstacles,
  targetVehicle,
  targetTrackObstacles,
  saboteur,
  allPlayers,
  highContrast,
  reducedMotion,
  onSteerLeft,
  onSteerRight,
  onJump,
  onBrake,
  onSelectObstacle,
  onPlaceObstacle,
}: ReverseRacingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<ReverseRacingRenderer>(new ReverseRacingRenderer());

  const [hoverLane, setHoverLane] = useState<Lane | null>(null);
  const [hoverDistance, setHoverDistance] = useState<number | null>(null);

  // Keyboard Event Listeners for Driving & Obstacle selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture inputs if typing into text fields
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onSteerLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onSteerRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          e.preventDefault();
          onJump();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          onBrake(0.05);
          break;
        case '1':
          e.preventDefault();
          onSelectObstacle('roadblock');
          break;
        case '2':
          e.preventDefault();
          onSelectObstacle('oil-slick');
          break;
        case '3':
          e.preventDefault();
          onSelectObstacle('speed-bump');
          break;
        case '4':
          e.preventDefault();
          onSelectObstacle('moving-wall');
          break;
        case '5':
          e.preventDefault();
          onSelectObstacle('fake-road');
          break;
        case '6':
          e.preventDefault();
          onSelectObstacle('boost-pad');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSteerLeft, onSteerRight, onJump, onBrake, onSelectObstacle]);

  // Handle pointer hover / click on the Saboteur Radar
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !targetVehicle) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const racerWidth = Math.floor(canvas.width * 0.58);
    const saboteurX = racerWidth + 8;
    const saboteurWidth = canvas.width - saboteurX;

    // Check if within saboteur radar
    if (mouseX >= saboteurX && mouseX <= canvas.width) {
      const trackMarginX = 36;
      const trackW = saboteurWidth - trackMarginX * 2;
      const trackY = 56;
      const trackH = canvas.height - 76;

      const relX = mouseX - (saboteurX + trackMarginX);
      const laneW = trackW / 3;

      if (relX >= 0 && relX <= trackW && mouseY >= trackY && mouseY <= trackY + trackH) {
        const laneIndex = Math.floor(relX / laneW); // 0, 1, 2
        const computedLane = (laneIndex - 1) as Lane; // -1, 0, 1

        const viewMeters = 100;
        const targetDist = targetVehicle.distance;
        const viewStartDist = Math.max(0, targetDist - 20);

        const relY = mouseY - trackY;
        const t = (trackH - relY) / trackH; // 0 (bottom) to 1 (top)
        const computedDistance = viewStartDist + t * viewMeters;

        setHoverLane(computedLane);
        setHoverDistance(computedDistance);
        return;
      }
    }

    setHoverLane(null);
    setHoverDistance(null);
  };

  const handlePointerLeave = () => {
    setHoverLane(null);
    setHoverDistance(null);
  };

  const handleClick = () => {
    if (hoverLane !== null && hoverDistance !== null) {
      onPlaceObstacle(hoverDistance, hoverLane);
    }
  };

  // Render on every frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current.render(
      ctx,
      canvas.width,
      canvas.height,
      localVehicle,
      localTrackObstacles,
      targetVehicle,
      targetTrackObstacles,
      saboteur,
      allPlayers,
      {
        highContrast,
        reducedMotion,
        hoverLane,
        hoverDistance,
      },
    );
  }, [
    localVehicle,
    localTrackObstacles,
    targetVehicle,
    targetTrackObstacles,
    saboteur,
    allPlayers,
    highContrast,
    reducedMotion,
    hoverLane,
    hoverDistance,
  ]);

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-xl border border-deck-border/60 bg-deck-900 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="block h-auto w-full cursor-crosshair touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        aria-label="Reverse Racing Interactive Dual Track"
      />
    </div>
  );
}
