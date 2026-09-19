'use client';

import React, { useCallback, useRef } from 'react';
import { ARENA_HEIGHT, ARENA_WIDTH } from '../engine/gravity-physics';
import { useGravityGolfLoop } from '../hooks/use-gravity-golf-loop';
import { GravityGolfRenderer } from '../render/gravity-golf-renderer';
import type {
  AsteroidHazard,
  BallState,
  CosmicCup,
  GravityObject,
  GravityObjectType,
  Vector2D,
  WallSegment,
} from '../types/gravity-golf.types';

interface GravityGolfCanvasProps {
  ball: BallState;
  objects: GravityObject[];
  hazards: AsteroidHazard[];
  walls: WallSegment[];
  cup: CosmicCup;
  trajectoryPoints: Vector2D[];
  selectedTool: GravityObjectType | null;
  selectedObjectId?: string | null;
  previewHoverPos: Vector2D | null;
  reducedMotion: boolean;
  highContrast: boolean;
  showTrajectory: boolean;
  onTick: (dt: number, timeMs: number) => void;
  onPlaceObject: (pos: Vector2D, type: GravityObjectType) => void;
  onSelectObject: (id: string | null) => void;
  onMoveObject: (id: string, newPos: Vector2D) => void;
  onHoverPosChange: (pos: Vector2D | null) => void;
}

export function GravityGolfCanvas({
  ball,
  objects,
  hazards,
  walls,
  cup,
  trajectoryPoints,
  selectedTool,
  selectedObjectId: _selectedObjectId,
  previewHoverPos,
  reducedMotion,
  highContrast,
  showTrajectory,
  onTick,
  onPlaceObject,
  onSelectObject,
  onMoveObject,
  onHoverPosChange,
}: GravityGolfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GravityGolfRenderer | null>(null);
  const draggingIdRef = useRef<string | null>(null);

  if (!rendererRef.current) {
    rendererRef.current = new GravityGolfRenderer();
  }

  // Animation frame loop
  useGravityGolfLoop({
    isActive: true,
    onTick: (dt, timeMs) => {
      onTick(dt, timeMs);

      const canvas = canvasRef.current;
      if (!canvas || !rendererRef.current) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      rendererRef.current.render(
        ctx,
        ball,
        objects,
        hazards,
        walls,
        cup,
        trajectoryPoints,
        timeMs,
        {
          reducedMotion,
          highContrast,
          showTrajectory,
          scale: 1,
        },
        previewHoverPos,
        selectedTool,
      );
    },
  });

  // Convert client coordinates to virtual 1000x600 arena coordinates
  const getArenaCoords = useCallback((e: React.MouseEvent | React.TouchEvent): Vector2D | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    const isTouch = 'touches' in e;
    if (isTouch && e.touches.length === 0) return null;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, []);

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getArenaCoords(e);
    if (!coords) return;

    // Check if clicked an existing object
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const dx = obj.position.x - coords.x;
      const dy = obj.position.y - coords.y;
      const hitRadius = obj.radius || 30;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        onSelectObject(obj.id);
        draggingIdRef.current = obj.id;
        return;
      }
    }

    // Otherwise place a new object if tool is active and ball is idle
    if (selectedTool && ball.status === 'idle') {
      onPlaceObject(coords, selectedTool);
    } else {
      onSelectObject(null);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getArenaCoords(e);
    if (!coords) return;

    if (draggingIdRef.current) {
      onMoveObject(draggingIdRef.current, coords);
    } else {
      onHoverPosChange(coords);
    }
  };

  const handlePointerUp = () => {
    draggingIdRef.current = null;
  };

  const handlePointerLeave = () => {
    draggingIdRef.current = null;
    onHoverPosChange(null);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getArenaCoords(e);
    if (!coords) return;

    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      const dx = obj.position.x - coords.x;
      const dy = obj.position.y - coords.y;
      const hitRadius = (obj.radius || 30) * 1.3;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        onSelectObject(obj.id);
        draggingIdRef.current = obj.id;
        return;
      }
    }

    if (selectedTool && ball.status === 'idle') {
      onPlaceObject(coords, selectedTool);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getArenaCoords(e);
    if (!coords) return;
    if (draggingIdRef.current) {
      onMoveObject(draggingIdRef.current, coords);
    }
  };

  return (
    <div className="relative w-full aspect-[5/3] rounded-xl overflow-hidden border border-surface-border bg-black shadow-2xl select-none">
      <canvas
        ref={canvasRef}
        width={ARENA_WIDTH}
        height={ARENA_HEIGHT}
        className="w-full h-full cursor-crosshair block"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handlePointerUp}
      />
    </div>
  );
}
