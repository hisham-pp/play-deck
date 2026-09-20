import { useState, useEffect, useRef, useCallback } from 'react';
import { createInitialLootDashState, stepLootDashArena } from '../engine/loot-engine';
import { lootSoundService } from '../services/loot-sound.service';
import { lootStatsRepository, type LootDashCareerStats } from '../services/loot-stats-repository';
import type {
  DashInput,
  LootDashArenaState,
  LootDashConfig,
  Vector2D,
} from '../types/loot-dash.types';

export const DEFAULT_CONFIG: LootDashConfig = {
  botCount: 3,
  botDifficulty: 'medium',
  roundDuration: 90,
  targetScore: 250,
  soundEnabled: true,
  highContrast: false,
  reducedMotion: false,
};

export function useLootDashGame(playerName = 'Sprinter') {
  const [config, setConfig] = useState<LootDashConfig>(DEFAULT_CONFIG);
  const [arenaState, setArenaState] = useState<LootDashArenaState>(() =>
    createInitialLootDashState(DEFAULT_CONFIG, playerName),
  );
  const [stats, setStats] = useState<LootDashCareerStats | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [mousePos, setMousePos] = useState<Vector2D | null>(null);

  const stateRef = useRef(arenaState);
  stateRef.current = arenaState;

  const configRef = useRef(config);
  configRef.current = config;

  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const inputsRef = useRef<Record<string, DashInput>>({
    'player-1': { moveX: 0, moveY: 0, activateTrap: false },
  });

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const recordedMatchRef = useRef(false);

  // Load career stats
  useEffect(() => {
    void lootStatsRepository.getStats().then(setStats);
  }, []);

  // Sync sound mute setting
  useEffect(() => {
    lootSoundService.setMuted(!config.soundEnabled);
  }, [config.soundEnabled]);

  // Main 60 FPS animation loop
  const loop = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const dt = Math.min(0.1, (time - lastTimeRef.current) / 1000);
    lastTimeRef.current = time;

    const current = stateRef.current;
    if (!isPausedRef.current && (current.status === 'playing' || current.status === 'countdown')) {
      const { nextState, events } = stepLootDashArena(
        current,
        inputsRef.current,
        configRef.current,
        dt,
      );

      // Reset single-frame activations
      const p1Input = inputsRef.current['player-1'];
      if (p1Input?.activateTrap) {
        p1Input.activateTrap = false;
      }

      // Handle sound events
      for (const ev of events) {
        if (ev.type === 'coin_pickup') {
          lootSoundService.playCoinPickup();
        } else if (ev.type === 'gem_pickup') {
          lootSoundService.playGemPickup();
        } else if (ev.type === 'chest_pickup' || ev.type === 'jackpot') {
          lootSoundService.playChestOpen();
        } else if (ev.type === 'powerup_activate') {
          lootSoundService.playPowerUp();
        } else if (ev.type === 'trap_trigger') {
          lootSoundService.playTrapHit('spikes');
        } else if (ev.type === 'steal') {
          lootSoundService.playSteal();
        } else if (ev.type === 'bump') {
          lootSoundService.playBump();
        }
      }

      // Record match finish stats
      if (nextState.status === 'match_over' && !recordedMatchRef.current) {
        recordedMatchRef.current = true;
        const p1Stats = nextState.stats['player-1'];
        const won = nextState.winnerId === 'player-1';

        if (won) {
          lootSoundService.playVictory();
        }

        if (p1Stats) {
          void lootStatsRepository
            .recordMatchCompletion(
              won,
              p1Stats.score,
              p1Stats.lootCollected,
              p1Stats.lootCollected,
              p1Stats.trapsTriggered,
              p1Stats.stealsCount,
              p1Stats.powerUpsUsed,
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

  // Keyboard navigation & controls
  useEffect(() => {
    const keysDown = new Set<string>();

    const updateInput = () => {
      const p1 = inputsRef.current['player-1'];
      if (!p1) return;

      let mx = 0;
      let my = 0;

      if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) my -= 1;
      if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) my += 1;
      if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) mx -= 1;
      if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) mx += 1;

      // Normalize diagonal speed
      if (mx !== 0 && my !== 0) {
        const invLen = 1 / Math.SQRT2;
        mx *= invLen;
        my *= invLen;
      }

      p1.moveX = mx;
      p1.moveY = my;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space' || e.code === 'KeyE') {
        const p1 = inputsRef.current['player-1'];
        if (p1) p1.activateTrap = true;
        return;
      }

      keysDown.add(e.code);
      updateInput();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.code);
      updateInput();
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
  }, []);

  const handleVirtualMove = useCallback((moveX: number, moveY: number) => {
    const p1 = inputsRef.current['player-1'];
    if (p1) {
      p1.moveX = moveX;
      p1.moveY = moveY;
    }
  }, []);

  const handleDeployTrap = useCallback(() => {
    const p1 = inputsRef.current['player-1'];
    if (p1) p1.activateTrap = true;
  }, []);

  const startMatch = useCallback(
    (overrides?: Partial<LootDashConfig>) => {
      const finalConfig = { ...configRef.current, ...overrides };
      setConfig(finalConfig);
      recordedMatchRef.current = false;
      inputsRef.current['player-1'] = { moveX: 0, moveY: 0, activateTrap: false };
      setArenaState(createInitialLootDashState(finalConfig, playerName));
    },
    [playerName],
  );

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
    handleVirtualMove,
    handleDeployTrap,
    handleCanvasMouseMove,
  };
}
