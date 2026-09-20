import { useState, useEffect, useRef, useCallback } from 'react';
import { createInitialArenaState, stepTinyTankArena } from '../engine/tank-engine';
import { tankSoundService } from '../services/tank-sound.service';
import { tankStatsRepository, type TinyTankStats } from '../services/tank-stats-repository';
import type {
  TinyTankArenaState,
  TinyTankConfig,
  TankInput,
  Vector2D,
  WeaponType,
} from '../types/tiny-tank.types';

export const DEFAULT_CONFIG: TinyTankConfig = {
  botCount: 3,
  botDifficulty: 'medium',
  roundDuration: 90,
  soundEnabled: true,
  highContrast: false,
  reducedMotion: false,
};

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
    'player-1': {
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

  // Load stats initially
  useEffect(() => {
    void tankStatsRepository.getStats().then(setStats);
  }, []);

  // Update sound service state
  useEffect(() => {
    tankSoundService.setMuted(!config.soundEnabled);
  }, [config.soundEnabled]);

  // Main 60 FPS animation loop
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

      // Play audio events
      for (const ev of events) {
        if (ev.type === 'fire') {
          tankSoundService.playFire(ev.weapon);
        } else if (ev.type === 'hit') {
          tankSoundService.playHit();
        } else if (ev.type === 'ricochet') {
          tankSoundService.playRicochet();
        } else if (ev.type === 'explosion') {
          tankSoundService.playExplosion();
        } else if (ev.type === 'barrel_boom') {
          tankSoundService.playExplosion();
        } else if (ev.type === 'crate_pickup') {
          tankSoundService.playCratePickup();
        } else if (ev.type === 'tank_destroyed') {
          tankSoundService.playTankDestroyed();
        }
      }

      // Record match end stats
      if (nextState.status === 'match_over' && !recordedMatchRef.current) {
        recordedMatchRef.current = true;
        const p1Stats = nextState.stats['player-1'];
        const won = nextState.winnerId === 'player-1';

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

      setArenaState(nextState);
    }

    requestRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  // Keyboard and mouse handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const p1 = inputsRef.current['player-1'];
      if (!p1) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') p1.moveForward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') p1.moveBackward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') p1.turnLeft = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') p1.turnRight = true;
      if (e.code === 'Space') {
        p1.fire = true;
        e.preventDefault();
      }

      // Quick weapon switches
      const weaponMap: Record<string, WeaponType> = {
        Digit1: 'cannon',
        Digit2: 'bouncing',
        Digit3: 'homing',
        Digit4: 'mine',
        Digit5: 'laser',
        Digit6: 'rubber',
      };
      if (weaponMap[e.code]) {
        p1.switchWeapon = weaponMap[e.code];
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const p1 = inputsRef.current['player-1'];
      if (!p1) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') p1.moveForward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') p1.moveBackward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') p1.turnLeft = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') p1.turnRight = false;
      if (e.code === 'Space') p1.fire = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleCanvasMouseMove = useCallback((canvasX: number, canvasY: number) => {
    setMousePos({ x: canvasX, y: canvasY });
    const p1 = stateRef.current.players.find((p) => p.id === 'player-1');
    const input = inputsRef.current['player-1'];
    if (p1 && input) {
      input.turretAngle = Math.atan2(canvasY - p1.position.y, canvasX - p1.position.x);
    }
  }, []);

  const handleCanvasMouseDown = useCallback(() => {
    const input = inputsRef.current['player-1'];
    if (input) input.fire = true;
  }, []);

  const handleCanvasMouseUp = useCallback(() => {
    const input = inputsRef.current['player-1'];
    if (input) input.fire = false;
  }, []);

  const startMatch = useCallback((overrides?: Partial<TinyTankConfig>) => {
    const finalConfig = { ...configRef.current, ...overrides };
    setConfig(finalConfig);
    recordedMatchRef.current = false;
    inputsRef.current['player-1'] = {
      moveForward: false,
      moveBackward: false,
      turnLeft: false,
      turnRight: false,
      turretAngle: 0,
      fire: false,
    };
    setArenaState(createInitialArenaState(finalConfig));
  }, []);

  const restartMatch = useCallback(() => {
    startMatch();
  }, [startMatch]);

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
    const p1 = inputsRef.current['player-1'];
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
