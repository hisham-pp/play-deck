import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialArenaState,
  stepTinyTankArena,
  type EngineEvent,
} from '../engine/tank-engine';
import { tankSoundService } from '../services/tank-sound.service';
import { tankStatsRepository, type TinyTankStats } from '../services/tank-stats-repository';
import {
  DEFAULT_PLAYER_ID,
  type TankInput,
  type TinyTankArenaState,
  type TinyTankConfig,
  type Vector2D,
  type WeaponType,
} from '../types/tiny-tank.types';
import { useTankKeyboardControls } from './use-tank-keyboard';

export const DEFAULT_CONFIG: TinyTankConfig = {
  botCount: 3,
  botDifficulty: 'medium',
  roundDuration: 90,
  soundEnabled: true,
  highContrast: false,
  reducedMotion: false,
};

function playAudioEvents(events: EngineEvent[]) {
  for (const ev of events) {
    if (ev.type === 'fire') {
      tankSoundService.playFire(ev.weapon);
    } else if (ev.type === 'hit') {
      tankSoundService.playHit();
    } else if (ev.type === 'ricochet') {
      tankSoundService.playRicochet();
    } else if (ev.type === 'explosion' || ev.type === 'barrel_boom') {
      tankSoundService.playExplosion();
    } else if (ev.type === 'crate_pickup') {
      tankSoundService.playCratePickup();
    } else if (ev.type === 'tank_destroyed') {
      tankSoundService.playTankDestroyed();
    }
  }
}

function handleMatchEndStats(
  nextState: TinyTankArenaState,
  setStats: (stats: TinyTankStats) => void,
) {
  const p1Stats = nextState.stats[DEFAULT_PLAYER_ID];
  const won = nextState.winnerId === DEFAULT_PLAYER_ID;

  if (p1Stats) {
    void tankStatsRepository
      .recordMatchCompletion(
        won,
        p1Stats.score,
        p1Stats.kills,
        p1Stats.damageDealt,
        p1Stats.shotsFired,
        p1Stats.shotsHit,
        p1Stats.cratesCollected,
      )
      .then(setStats);
  }
}

export function useTinyTankGame() {
  const [config, setConfig] = useState<TinyTankConfig>(DEFAULT_CONFIG);
  const [arenaState, setArenaState] = useState<TinyTankArenaState>(() =>
    createInitialArenaState(DEFAULT_CONFIG),
  );
  const [stats, setStats] = useState<TinyTankStats | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [mousePos, setMousePos] = useState<Vector2D | null>(null);

  const stateRef = useRef(arenaState);
  stateRef.current = arenaState;

  const configRef = useRef(config);
  configRef.current = config;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const inputsRef = useRef<Record<string, TankInput>>({
    [DEFAULT_PLAYER_ID]: {
      moveForward: false,
      moveBackward: false,
      turnLeft: false,
      turnRight: false,
      turretAngle: 0,
      fire: false,
    },
  });

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const recordedMatchRef = useRef(false);

  useEffect(() => {
    void tankStatsRepository.getStats().then(setStats);
  }, []);

  useEffect(() => {
    tankSoundService.setMuted(!config.soundEnabled);
  }, [config.soundEnabled]);

  useTankKeyboardControls(inputsRef);

  const loop = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const dt = Math.min(0.1, (time - lastTimeRef.current) / 1000);
    lastTimeRef.current = time;

    const current = stateRef.current;
    if (!isPausedRef.current && (current.status === 'playing' || current.status === 'countdown')) {
      const { nextState, events } = stepTinyTankArena(
        current,
        inputsRef.current,
        configRef.current,
        dt,
      );

      playAudioEvents(events);

      if (nextState.status === 'match_over' && !recordedMatchRef.current) {
        recordedMatchRef.current = true;
        handleMatchEndStats(nextState, setStats);
      }

      setArenaState(nextState);
    }

    requestRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  const handleCanvasMouseMove = useCallback((canvasX: number, canvasY: number) => {
    setMousePos({ x: canvasX, y: canvasY });
    const p1 = stateRef.current.players.find((p) => p.id === DEFAULT_PLAYER_ID);
    const input = inputsRef.current[DEFAULT_PLAYER_ID];
    if (p1 && input) {
      input.turretAngle = Math.atan2(canvasY - p1.position.y, canvasX - p1.position.x);
    }
  }, []);

  const handleCanvasMouseDown = useCallback(() => {
    const input = inputsRef.current[DEFAULT_PLAYER_ID];
    if (input) input.fire = true;
  }, []);

  const handleCanvasMouseUp = useCallback(() => {
    const input = inputsRef.current[DEFAULT_PLAYER_ID];
    if (input) input.fire = false;
  }, []);

  const startMatch = useCallback((overrides?: Partial<TinyTankConfig>) => {
    const finalConfig = { ...configRef.current, ...overrides };
    setConfig(finalConfig);
    recordedMatchRef.current = false;
    inputsRef.current[DEFAULT_PLAYER_ID] = {
      moveForward: false,
      moveBackward: false,
      turnLeft: false,
      turnRight: false,
      turretAngle: 0,
      fire: false,
    };
    setArenaState(createInitialArenaState(finalConfig));
  }, []);

  const restartMatch = useCallback(() => startMatch(), [startMatch]);
  const pauseMatch = useCallback(() => setIsPaused(true), []);
  const resumeMatch = useCallback(() => setIsPaused(false), []);
  const returnToLobby = useCallback(() => {
    setArenaState((s) => ({ ...s, status: 'lobby' }));
  }, []);

  const toggleSound = useCallback(() => {
    setConfig((c) => ({ ...c, soundEnabled: !c.soundEnabled }));
  }, []);

  const toggleHighContrast = useCallback(() => {
    setConfig((c) => ({ ...c, highContrast: !c.highContrast }));
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setConfig((c) => ({ ...c, reducedMotion: !c.reducedMotion }));
  }, []);

  const switchWeapon = useCallback((weapon: WeaponType) => {
    const p1 = inputsRef.current[DEFAULT_PLAYER_ID];
    if (p1) p1.switchWeapon = weapon;
  }, []);

  return {
    arenaState,
    config,
    stats,
    isPaused,
    mousePos,
    startMatch,
    restartMatch,
    pauseMatch,
    resumeMatch,
    returnToLobby,
    toggleSound,
    toggleHighContrast,
    toggleReducedMotion,
    switchWeapon,
    handleCanvasMouseMove,
    handleCanvasMouseDown,
    handleCanvasMouseUp,
  };
}
