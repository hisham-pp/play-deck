import { useCallback, useEffect, useRef, useState } from 'react';
import {
  advanceToNextHole,
  computeAiShot,
  createInitialMiniGolfState,
  executeShot,
  restartGame,
  tickGame,
} from '../engine/mini-golf-engine';
import { calculateTrajectory } from '../engine/mini-golf-physics';
import type { GameMode, MiniGolfState, Player, ShotPreview } from '../engine/mini-golf-types';
import { miniGolfSound } from '../services/mini-golf-sound.service';
import { miniGolfStatsRepository } from '../services/mini-golf-stats-repository';

export function useMiniGolfEngine(initialMode: GameMode = 'solo', customPlayers?: Player[]) {
  const [state, setState] = useState<MiniGolfState>(() =>
    createInitialMiniGolfState(initialMode, customPlayers),
  );
  const [shotPreview, setShotPreview] = useState<ShotPreview | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const lastTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sound enabled synchronization
  useEffect(() => {
    miniGolfSound.setSoundEnabled(!state.isMuted);
  }, [state.isMuted]);

  // Main Physics & Animation Loop
  useEffect(() => {
    let active = true;

    const loop = (timestamp: number) => {
      if (!active) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Cap delta time to prevent physics explosions on tab switch
      const dt = Math.min(0.04, Math.max(0.001, rawDt));

      const currentState = stateRef.current;
      const { state: nextState, events } = tickGame(currentState, dt);

      // Play audio events
      if (events.hitWall) miniGolfSound.playWallBounce(0.6);
      if (events.hitBumper) miniGolfSound.playBumperHit();
      if (events.hitSand) miniGolfSound.playSandThud();
      if (events.hitWater) miniGolfSound.playWaterSplash();
      if (events.lipOut) miniGolfSound.playLipOut();
      if (events.inHole) {
        miniGolfSound.playCupDrop();
        const currentHole = currentState.holes[currentState.currentHoleIndex];
        const underPar = currentState.currentStrokes + 1 < currentHole.par;
        setTimeout(() => miniGolfSound.playHoleClear(underPar), 180);

        // Record hole statistics
        const activePlayer = currentState.players[currentState.activePlayerIndex];
        const scorecard = nextState.scorecards[activePlayer.id];
        const isLastHole = nextState.currentHoleIndex === nextState.holes.length - 1;
        miniGolfStatsRepository.recordRoundResult(scorecard, isLastHole).catch(() => {});
      }

      if (nextState !== currentState) {
        setState(nextState);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      lastTimeRef.current = null;
    };
  }, []);

  // Handle AI turn execution when active player is an AI bot
  useEffect(() => {
    const currentState = state;
    const activePlayer = currentState.players[currentState.activePlayerIndex];

    if (activePlayer?.isAi && currentState.phase === 'aiming' && currentState.ball.isResting) {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

      aiTimeoutRef.current = setTimeout(() => {
        const aiShot = computeAiShot(stateRef.current);
        miniGolfSound.playPutt(aiShot.power);
        setState((prev) => executeShot(prev, aiShot.angle, aiShot.power));
      }, 900);
    }

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [state.activePlayerIndex, state.phase, state.ball.isResting]);

  // Public Actions
  const shoot = useCallback((angle: number, power: number) => {
    const currentState = stateRef.current;
    if (currentState.phase !== 'aiming') return;

    miniGolfSound.playPutt(power);
    setShotPreview(null);
    setState((prev) => executeShot(prev, angle, power));
  }, []);

  const updateAimPreview = useCallback((angle: number, power: number) => {
    const currentState = stateRef.current;
    if (currentState.phase !== 'aiming') {
      setShotPreview(null);
      return;
    }

    const currentHole = currentState.holes[currentState.currentHoleIndex];
    const origin = { x: currentState.ball.x, y: currentState.ball.y };
    const previewPoints = calculateTrajectory(origin, angle, power, currentHole);

    setShotPreview({
      origin,
      angle,
      power,
      previewPoints,
    });
  }, []);

  const clearAimPreview = useCallback(() => {
    setShotPreview(null);
  }, []);

  const nextHole = useCallback(() => {
    setState((prev) => advanceToNextHole(prev));
    setShotPreview(null);
  }, []);

  const restart = useCallback(() => {
    setState((prev) => restartGame(prev));
    setShotPreview(null);
  }, []);

  const toggleMute = useCallback(() => {
    setState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const changeMode = useCallback((newMode: GameMode) => {
    setState(createInitialMiniGolfState(newMode));
    setShotPreview(null);
  }, []);

  return {
    state,
    shotPreview,
    shoot,
    updateAimPreview,
    clearAimPreview,
    nextHole,
    restart,
    toggleMute,
    changeMode,
  };
}
