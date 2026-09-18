import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialConveyorState,
  tickConveyorGame,
  updateSegmentControl,
} from '../engine/conveyor-engine';
import { CONVEYOR_LAYOUTS, getLayoutById } from '../engine/conveyor-layouts';
import type { ConveyorGameState, MachineConfig } from '../engine/conveyor-types';
import { conveyorSound } from '../services/conveyor-sound.service';

export interface UseConveyorEngineOptions {
  layoutId?: string;
  playerRoster?: Array<{ id: string; name: string; isBot?: boolean }>;
  onPlatformUpdate?: (seatIndex: number, angle: number, elevation: number, speed: number) => void;
}

export function useConveyorEngine({
  layoutId = CONVEYOR_LAYOUTS[0].id,
  playerRoster = [],
  onPlatformUpdate,
}: UseConveyorEngineOptions = {}) {
  const [layout, setLayout] = useState<MachineConfig>(() => getLayoutById(layoutId));
  const [gameState, setGameState] = useState<ConveyorGameState>(() =>
    createInitialConveyorState(getLayoutById(layoutId), playerRoster),
  );

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Sound triggering when events occur
  useEffect(() => {
    if (!gameState.lastEvent) return;
    if (gameState.lastEvent.type === 'delivered') {
      conveyorSound.playDelivery();
    } else if (gameState.lastEvent.type === 'broken') {
      conveyorSound.playShatter();
    } else if (gameState.lastEvent.type === 'dropped') {
      conveyorSound.playDrop();
    }
  }, [gameState.lastEvent]);

  // Main animation / physics loop
  useEffect(() => {
    if (gameState.phase !== 'running') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      setGameState((prev) => tickConveyorGame(prev, dt));
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState.phase]);

  const startMatch = useCallback(
    (chosenLayoutId?: string) => {
      const selected = chosenLayoutId ? getLayoutById(chosenLayoutId) : layout;
      setLayout(selected);
      const initial = createInitialConveyorState(selected, playerRoster);
      initial.phase = 'running';
      setGameState(initial);
    },
    [layout, playerRoster],
  );

  const pauseMatch = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      phase: prev.phase === 'running' ? 'paused' : 'running',
    }));
  }, []);

  const adjustSegment = useCallback(
    (
      seatIndex: number,
      delta: { angleDelta?: number; elevationDelta?: number; speedDelta?: number },
    ) => {
      setGameState((prev) => {
        const next = updateSegmentControl(prev, seatIndex, delta);
        const seg = next.segments[seatIndex];
        if (seg && onPlatformUpdate) {
          onPlatformUpdate(seatIndex, seg.targetAngle, seg.targetElevation, seg.targetSpeed);
        }
        return next;
      });
    },
    [onPlatformUpdate],
  );

  const applyRemoteSegmentUpdate = useCallback(
    (seatIndex: number, angle: number, elevation: number, speed: number) => {
      setGameState((prev) => ({
        ...prev,
        segments: prev.segments.map((s, idx) =>
          idx === seatIndex
            ? { ...s, targetAngle: angle, targetElevation: elevation, targetSpeed: speed }
            : s,
        ),
      }));
    },
    [],
  );

  return {
    gameState,
    layout,
    startMatch,
    pauseMatch,
    adjustSegment,
    applyRemoteSegmentUpdate,
  };
}
