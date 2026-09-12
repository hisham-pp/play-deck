'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Suspense } from 'react';
import { PCFShadowMap } from 'three';
import '@/lib/three-patch';
import { resolveLayout } from '../../engine/board-layout';
import type { LudoGameState } from '../../types/ludo.types';
import { BOARD_PHYSICAL_SIZE } from './board-geometry';
import { LudoBoard3D } from './LudoBoard3D';
import { LudoDice3D } from './LudoDice3D';
import { LudoPiece3D } from './LudoPiece3D';

const WALL_HEIGHT = 1.6;
const HALF_BOARD = BOARD_PHYSICAL_SIZE / 2;

interface LudoSceneProps {
  state: LudoGameState;
  legalPieceIds: string[];
  onSelectPiece: (pieceId: string) => void;
  rolling: boolean;
  diceTargetValue: number | null;
  onRollComplete: () => void;
  onRollDice?: () => void;
}

export default function LudoScene({
  state,
  legalPieceIds,
  onSelectPiece,
  rolling,
  diceTargetValue,
  onRollComplete,
  onRollDice,
}: LudoSceneProps) {
  const layout = resolveLayout(state.players.length);
  const allPieces = state.players.flatMap((p) => p.pieces);
  const legalSet = new Set(legalPieceIds);

  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      camera={{ position: [0, 12, 4.8], fov: 42 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[6, 12, 8]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-6, 8, -6]} intensity={0.4} />

      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={20}
        makeDefault
      />

      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
          {/* The board meshes are decorative only; the die needs real colliders
              to land on, plus low walls so it cannot tumble off the edge. */}
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[HALF_BOARD, 0.05, HALF_BOARD]} position={[0, 0, 0]} />
            <CuboidCollider
              args={[0.05, WALL_HEIGHT, HALF_BOARD]}
              position={[HALF_BOARD, WALL_HEIGHT, 0]}
            />
            <CuboidCollider
              args={[0.05, WALL_HEIGHT, HALF_BOARD]}
              position={[-HALF_BOARD, WALL_HEIGHT, 0]}
            />
            <CuboidCollider
              args={[HALF_BOARD, WALL_HEIGHT, 0.05]}
              position={[0, WALL_HEIGHT, HALF_BOARD]}
            />
            <CuboidCollider
              args={[HALF_BOARD, WALL_HEIGHT, 0.05]}
              position={[0, WALL_HEIGHT, -HALF_BOARD]}
            />
          </RigidBody>

          <LudoBoard3D layout={layout} />

          {allPieces.map((piece) => (
            <LudoPiece3D
              key={piece.id}
              layout={layout}
              piece={piece}
              isLegalMove={legalSet.has(piece.id)}
              onSelectPiece={onSelectPiece}
            />
          ))}

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
