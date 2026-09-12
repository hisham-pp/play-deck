'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { resolveLayout } from '../../engine/board-layout';
import type { LudoGameState } from '../../types/ludo.types';
import { LudoBoard3D } from './LudoBoard3D';
import { LudoDice3D } from './LudoDice3D';
import { LudoPiece3D } from './LudoPiece3D';

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
      shadows
      camera={{ position: [0, 8.2, 7.2], fov: 42 }}
      style={{ width: '100%', height: '100%', minHeight: '440px' }}
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
        maxDistance={14}
        makeDefault
      />

      <Suspense fallback={null}>
        <Physics gravity={[0, -9.81, 0]}>
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
