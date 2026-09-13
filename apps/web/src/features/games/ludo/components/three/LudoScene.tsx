'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useMemo } from 'react';
import { PCFShadowMap } from 'three';
import '@/lib/three-patch';
import { resolveLayout } from '../../engine/board-layout';
import type { LudoGameState, LudoPieceState } from '../../types/ludo.types';
import { BOARD_PHYSICAL_SIZE, boardExtent, pieceCellKey } from './board-geometry';
import { LudoBoard3D } from './LudoBoard3D';
import { LudoDice3D } from './LudoDice3D';
import { LudoPiece3D } from './LudoPiece3D';

const WALL_HEIGHT = 1.6;
/** Close enough to read a stacked square, on either board size. */
const MIN_ZOOM_DISTANCE = 5;
/** Camera framing that suits the classic board, scaled to any board size. */
const CLASSIC_HALF = BOARD_PHYSICAL_SIZE / 2;
const CAMERA_HEIGHT_PER_HALF = 12 / CLASSIC_HALF;
const CAMERA_DEPTH_PER_HALF = 4.8 / CLASSIC_HALF;

interface LudoSceneProps {
  state: LudoGameState;
  legalPieceIds: string[];
  /** Pieces the local player can pick right now, in hotkey order. */
  numberedPieceIds: string[];
  onSelectPiece: (pieceId: string) => void;
  rolling: boolean;
  diceTargetValue: number | null;
  onRollComplete: () => void;
  onRollDice?: () => void;
}

/**
 * Groups pieces by the square they occupy, so pieces sharing one square can be
 * shrunk to fit inside it instead of burying each other.
 */
function buildStacks(
  pieces: LudoPieceState[],
  cellKey: (piece: LudoPieceState) => string,
): Map<string, { index: number; count: number }> {
  const byCell = new Map<string, string[]>();
  for (const piece of pieces) {
    const key = cellKey(piece);
    const bucket = byCell.get(key);
    if (bucket) bucket.push(piece.id);
    else byCell.set(key, [piece.id]);
  }

  const stacks = new Map<string, { index: number; count: number }>();
  for (const ids of byCell.values()) {
    ids.forEach((id, index) => stacks.set(id, { index, count: ids.length }));
  }
  return stacks;
}

export default function LudoScene({
  state,
  legalPieceIds,
  numberedPieceIds,
  onSelectPiece,
  rolling,
  diceTargetValue,
  onRollComplete,
  onRollDice,
}: LudoSceneProps) {
  const layout = resolveLayout(state.players.length);
  const allPieces = useMemo(() => state.players.flatMap((p) => p.pieces), [state.players]);
  const stacks = useMemo(
    () => buildStacks(allPieces, (piece) => pieceCellKey(layout, piece)),
    [allPieces, layout],
  );
  const legalSet = useMemo(() => new Set(legalPieceIds), [legalPieceIds]);
  // Only the local player's own options are numbered: a number promises that
  // pressing that key moves the piece, which is untrue on someone else's turn.
  const moveNumbers = useMemo(() => {
    const numbers = new Map<string, number>();
    numberedPieceIds.forEach((id, index) => numbers.set(id, index + 1));
    return numbers;
  }, [numberedPieceIds]);

  const half = boardExtent(layout);
  const cameraPosition: [number, number, number] = [
    0,
    half * CAMERA_HEIGHT_PER_HALF,
    half * CAMERA_DEPTH_PER_HALF,
  ];

  return (
    <Canvas
      // Board size drives the camera, and Canvas only reads `camera` on mount,
      // so a switch between the cross and hex boards has to remount the scene.
      key={layout.id}
      shadows={{ type: PCFShadowMap }}
      camera={{ position: cameraPosition, fov: 42 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[half * 1.6, half * 3.1, half * 2.1]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-half * 1.4}
        shadow-camera-right={half * 1.4}
        shadow-camera-top={half * 1.4}
        shadow-camera-bottom={-half * 1.4}
        shadow-camera-far={half * 8}
      />
      <directionalLight position={[-half * 1.6, half * 2.1, -half * 1.6]} intensity={0.4} />

      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={MIN_ZOOM_DISTANCE}
        maxDistance={half * 5.2}
        makeDefault
      />

      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
          {/* The board meshes are decorative only; the die needs real colliders
              to land on, plus low walls so it cannot tumble off the edge. */}
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[half, 0.05, half]} position={[0, 0, 0]} />
            <CuboidCollider args={[0.05, WALL_HEIGHT, half]} position={[half, WALL_HEIGHT, 0]} />
            <CuboidCollider args={[0.05, WALL_HEIGHT, half]} position={[-half, WALL_HEIGHT, 0]} />
            <CuboidCollider args={[half, WALL_HEIGHT, 0.05]} position={[0, WALL_HEIGHT, half]} />
            <CuboidCollider args={[half, WALL_HEIGHT, 0.05]} position={[0, WALL_HEIGHT, -half]} />
          </RigidBody>

          <LudoBoard3D layout={layout} />

          {allPieces.map((piece) => {
            const stack = stacks.get(piece.id);
            return (
              <LudoPiece3D
                key={piece.id}
                layout={layout}
                piece={piece}
                isLegalMove={legalSet.has(piece.id)}
                moveNumber={moveNumbers.get(piece.id) ?? null}
                stackIndex={stack?.index ?? 0}
                stackCount={stack?.count ?? 1}
                onSelectPiece={onSelectPiece}
              />
            );
          })}

          <LudoDice3D
            rolling={rolling}
            targetValue={diceTargetValue}
            onRollComplete={onRollComplete}
            onRollDice={onRollDice}
          />
        </Physics>
      </Suspense>
    </Canvas>
  );
}
