import { useCallback, useEffect, useMemo, useState } from 'react';
import { BALL_RADIUS, stepPhysicsTick } from '../engine/gravity-physics';
import { COSMIC_HOLES } from '../engine/holes-catalog';
import { calculateStarRating, getGolfScoreTerm } from '../engine/scoring';
import { predictTrajectory } from '../engine/trajectory-predictor';
import { gravityGolfSound } from '../services/gravity-golf-sound.service';
import { gravityGolfStatsRepository } from '../services/gravity-golf-stats-repository';
import type {
  BallState,
  GameMode,
  GravityObject,
  GravityObjectType,
  HoleDefinition,
  HoleScore,
  Vector2D,
} from '../types/gravity-golf.types';

export function useGravityGolfGame(initialHoleNumber = 1, mode: GameMode = 'solo') {
  const [holeIndex, setHoleIndex] = useState(initialHoleNumber - 1);
  const hole: HoleDefinition = COSMIC_HOLES[holeIndex] || COSMIC_HOLES[0];

  const [placedObjects, setPlacedObjects] = useState<GravityObject[]>([]);
  const [selectedTool, setSelectedTool] = useState<GravityObjectType | null>('attractor');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  // Accessibility & visual options
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scoring
  const [holeScores, setHoleScores] = useState<Record<number, HoleScore>>({});
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  // Ball state
  const initialBall: BallState = useMemo(
    () => ({
      position: { ...hole.ballSpawn },
      velocity: hole.initialVelocity ? { ...hole.initialVelocity } : { x: 150, y: 0 },
      radius: BALL_RADIUS,
      status: 'idle',
      trail: [],
      flightTicks: 0,
    }),
    [hole],
  );

  const [ball, setBall] = useState<BallState>(initialBall);
  const [previewHoverPos, setPreviewHoverPos] = useState<Vector2D | null>(null);

  // Combine fixed objects on the hole with user-placed objects
  const allObjects = useMemo(
    () => [...hole.fixedObjects, ...placedObjects],
    [hole.fixedObjects, placedObjects],
  );

  // Compute remaining item counts
  const itemCounts = useMemo(() => {
    const counts: Record<GravityObjectType, number> = {
      attractor: 0,
      repeller: 0,
      directional: 0,
      'orbit-ring': 0,
      'gravity-wall': 0,
    };
    for (const obj of placedObjects) {
      counts[obj.type] = (counts[obj.type] || 0) + 1;
    }
    return counts;
  }, [placedObjects]);

  const canPlaceTool = useCallback(
    (type: GravityObjectType) => {
      const current = itemCounts[type] || 0;
      const limit = hole.allowedItems[type] || 0;
      return current < limit;
    },
    [itemCounts, hole.allowedItems],
  );

  // Trajectory preview
  const trajectoryPoints = useMemo(() => {
    if (!showTrajectory || ball.status !== 'idle') return [];
    const launchVel = hole.initialVelocity || { x: 150, y: 0 };
    const res = predictTrajectory(
      hole.ballSpawn,
      launchVel,
      allObjects,
      hole.hazards,
      hole.walls,
      hole.cup,
      140,
    );
    return res.points;
  }, [showTrajectory, ball.status, hole, allObjects]);

  // Reset ball to tee
  const resetBall = useCallback(() => {
    setBall({
      position: { ...hole.ballSpawn },
      velocity: hole.initialVelocity ? { ...hole.initialVelocity } : { x: 150, y: 0 },
      radius: BALL_RADIUS,
      status: 'idle',
      trail: [],
      flightTicks: 0,
    });
  }, [hole]);

  // Reset current hole objects and ball
  const resetHole = useCallback(() => {
    setPlacedObjects([]);
    setSelectedObjectId(null);
    resetBall();
    gravityGolfSound.playRemoveObject();
  }, [resetBall]);

  // Launch ball
  const launch = useCallback(() => {
    if (ball.status !== 'idle') return;
    setBall((prev) => ({
      ...prev,
      velocity: hole.initialVelocity ? { ...hole.initialVelocity } : { x: 150, y: 0 },
      status: 'in_flight',
      flightTicks: 0,
      trail: [{ ...prev.position }],
    }));
    gravityGolfSound.playLaunch();
  }, [ball.status, hole.initialVelocity]);

  // Place or move object
  const placeObject = useCallback(
    (pos: Vector2D, type: GravityObjectType) => {
      if (ball.status === 'in_flight') return;
      if (!canPlaceTool(type)) return;

      const newObj: GravityObject = {
        id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        position: { ...pos },
        radius: type === 'orbit-ring' ? 55 : 24,
        strength: 1,
        direction: type === 'directional' ? { x: 1, y: 0 } : undefined,
        length: type === 'gravity-wall' ? 80 : undefined,
        angle: type === 'gravity-wall' ? 0 : undefined,
      };

      setPlacedObjects((prev) => [...prev, newObj]);
      setSelectedObjectId(newObj.id);
      gravityGolfSound.playPlaceObject();
    },
    [ball.status, canPlaceTool],
  );

  const removeObject = useCallback(
    (id: string) => {
      if (ball.status === 'in_flight') return;
      setPlacedObjects((prev) => prev.filter((o) => o.id !== id));
      if (selectedObjectId === id) {
        setSelectedObjectId(null);
      }
      gravityGolfSound.playRemoveObject();
    },
    [ball.status, selectedObjectId],
  );

  const updateObject = useCallback((id: string, updates: Partial<GravityObject>) => {
    setPlacedObjects((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  }, []);

  // Next / Previous hole navigation
  const goToHole = useCallback((targetHoleNumber: number) => {
    const idx = targetHoleNumber - 1;
    if (idx >= 0 && idx < COSMIC_HOLES.length) {
      setHoleIndex(idx);
      setPlacedObjects([]);
      setSelectedObjectId(null);
      setIsVictoryModalOpen(false);
    }
  }, []);

  const nextHole = useCallback(() => {
    if (holeIndex < COSMIC_HOLES.length - 1) {
      goToHole(holeIndex + 2);
    }
  }, [holeIndex, goToHole]);

  // Record completed score
  const handleBallSunk = useCallback(
    (strokes: number) => {
      const diff = strokes - hole.par;
      const score: HoleScore = {
        holeNumber: hole.number,
        strokes,
        par: hole.par,
        status: 'completed',
        scoreDifference: diff,
      };

      setHoleScores((prev) => ({ ...prev, [hole.number]: score }));
      const stars = calculateStarRating(strokes, hole.par);
      gravityGolfStatsRepository.recordHoleCompletion(hole.number, strokes, stars);
      gravityGolfSound.playCupSink();
      setIsVictoryModalOpen(true);
    },
    [hole],
  );

  // Physics loop callback
  const stepSimulation = useCallback(
    (_dt: number, _now: number) => {
      if (ball.status !== 'in_flight') return;

      const { ball: nextBall, bounced } = stepPhysicsTick(
        ball,
        allObjects,
        hole.hazards,
        hole.walls,
        hole.cup,
      );

      if (bounced) {
        gravityGolfSound.playBounce();
      }

      if (nextBall.status === 'sunk') {
        const strokes = placedObjects.length;
        handleBallSunk(strokes);
      } else if (nextBall.status === 'absorbed') {
        gravityGolfSound.playHazardAbsorb();
        // Auto reset after 1s
        setTimeout(() => resetBall(), 900);
      } else if (nextBall.status === 'out_of_bounds') {
        // Auto reset after 1s
        setTimeout(() => resetBall(), 800);
      }

      setBall(nextBall);
    },
    [ball, allObjects, hole, placedObjects.length, handleBallSunk, resetBall],
  );

  // Toggle sound
  const toggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    gravityGolfSound.setSoundEnabled(next);
  }, [soundEnabled]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (ball.status === 'idle') launch();
        else resetBall();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetHole();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObjectId) {
          e.preventDefault();
          removeObject(selectedObjectId);
        }
      } else if (e.key === '1') {
        setSelectedTool('attractor');
      } else if (e.key === '2') {
        setSelectedTool('repeller');
      } else if (e.key === '3') {
        setSelectedTool('directional');
      } else if (e.key === '4') {
        setSelectedTool('orbit-ring');
      } else if (e.key === '5') {
        setSelectedTool('gravity-wall');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ball.status, launch, resetBall, resetHole, selectedObjectId, removeObject]);

  return {
    hole,
    holeIndex,
    allObjects,
    placedObjects,
    setPlacedObjects,
    selectedTool,
    setSelectedTool,
    selectedObjectId,
    setSelectedObjectId,
    ball,
    setBall,
    previewHoverPos,
    setPreviewHoverPos,
    trajectoryPoints,
    itemCounts,
    canPlaceTool,
    placeObject,
    removeObject,
    updateObject,
    launch,
    resetBall,
    resetHole,
    stepSimulation,
    nextHole,
    goToHole,
    holeScores,
    isVictoryModalOpen,
    setIsVictoryModalOpen,
    scoreTerm: getGolfScoreTerm(placedObjects.length, hole.par),
    // Settings
    reducedMotion,
    setReducedMotion,
    highContrast,
    setHighContrast,
    showTrajectory,
    setShowTrajectory,
    soundEnabled,
    toggleSound,
    mode,
  };
}
