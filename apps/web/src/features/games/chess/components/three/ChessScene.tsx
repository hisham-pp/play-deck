'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { PCFShadowMap } from 'three';
import '@/lib/three-patch';
import { findKing } from '../../engine/chess-board';
import { TOTAL_SQUARES } from '../../engine/chess-constants';
import type { ChessGameState, PieceColor } from '../../types/chess.types';
import { cameraPositionFor, CAMERA_FOV, framingScale, MAX_ZOOM, MIN_ZOOM } from './board-metrics';
import { ChessBoard3D, type BoardHighlights } from './ChessBoard3D';
import { ChessPiece3D } from './ChessPiece3D';
import { nextIdentityState, type IdentityState } from './piece-identities';

/** How fast the camera swings round when the board is flipped. */
const FLIP_RATE = 3.2;

export interface ChessSceneProps {
  state: ChessGameState;
  orientation: PieceColor;
  highlights: BoardHighlights;
  onSelectSquare: (square: number) => void;
}

/** The part of OrbitControls the flip animation drives. */
interface OrbitLike {
  update(): void;
  addEventListener(type: 'start', listener: () => void): void;
  removeEventListener(type: 'start', listener: () => void): void;
}

/** Shortest signed way round from one angle to another. */
function shortestTurn(from: number, to: number): number {
  let difference = to - from;
  while (difference > Math.PI) difference -= Math.PI * 2;
  while (difference < -Math.PI) difference += Math.PI * 2;
  return difference;
}

/**
 * Swings the view to the other end of the board when the orientation changes.
 *
 * It moves the orbit angle rather than the camera itself, so the controls stay
 * the single owner of the camera and the player can keep dragging mid-flip.
 * Flipping being a camera move also means no square, piece or highlight has to
 * know which way round the board is being viewed.
 */
function CameraRig({ orientation }: { orientation: PieceColor }) {
  const controls = useThree((scene) => scene.controls) as unknown as OrbitLike | null;
  const camera = useThree((scene) => scene.camera);
  const targetAzimuth = orientation === 'w' ? 0 : Math.PI;
  // Only a flip animates. Once the view arrives -- or the player grabs it --
  // the camera is left wherever they put it.
  const flippingRef = useRef(false);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    flippingRef.current = true;
  }, [orientation]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => {
      flippingRef.current = false;
    };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  useFrame((_, delta) => {
    if (!flippingRef.current) return;

    // Orbit the camera itself about the vertical axis. Driving the controls'
    // azimuth instead fights their damping and can stall part-way round.
    const current = Math.atan2(camera.position.x, camera.position.z);
    const turn = shortestTurn(current, targetAzimuth);
    const step = Math.abs(turn) < 0.01 ? turn : turn * Math.min(1, delta * FLIP_RATE);
    if (Math.abs(turn) < 0.01) flippingRef.current = false;

    const radius = Math.hypot(camera.position.x, camera.position.z);
    const next = current + step;
    camera.position.x = Math.sin(next) * radius;
    camera.position.z = Math.cos(next) * radius;
    camera.lookAt(0, 0, 0);
    controls?.update();
  });

  return null;
}

/**
 * Pulls the camera back whenever the viewport gets too narrow for the board,
 * keeping the current viewing angle. It runs on resize only, so a player's own
 * zoom is left alone the rest of the time.
 */
function useFramingDistance(): number {
  const aspect = useThree((scene) => scene.size.width / Math.max(1, scene.size.height));
  return Math.hypot(...cameraPositionFor('w')) * framingScale(aspect);
}

function CameraFit() {
  const camera = useThree((scene) => scene.camera);
  const controls = useThree((scene) => scene.controls) as unknown as OrbitLike | null;
  const distance = useFramingDistance();

  useEffect(() => {
    camera.position.setLength(distance);
    camera.lookAt(0, 0, 0);
    controls?.update();
  }, [distance, camera, controls]);

  return null;
}

/** Orbit controls whose zoom-out limit always allows the fitted framing. */
function FittedOrbitControls() {
  const distance = useFramingDistance();
  return (
    <OrbitControls
      enablePan={false}
      maxPolarAngle={Math.PI / 2.35}
      minDistance={MIN_ZOOM}
      maxDistance={Math.max(MAX_ZOOM, distance * 1.3)}
      makeDefault
    />
  );
}

/**
 * Pieces are rendered from the board, but keyed by a tracked identity rather
 * than by square, so a moved piece is the same React element on a new square
 * and can travel there.
 */
function Pieces({
  state,
  selected,
  onSelectSquare,
}: {
  state: ChessGameState;
  selected: number | null;
  onSelectSquare: (square: number) => void;
}) {
  const identityRef = useRef<IdentityState | null>(null);
  identityRef.current = nextIdentityState(identityRef.current, state.position.board, state.history);
  const { identities } = identityRef.current;

  const checkedKing = state.check ? findKing(state.position.board, state.position.turn) : -1;

  return (
    <group>
      {Array.from({ length: TOTAL_SQUARES }, (_, square) => {
        const piece = state.position.board[square];
        const id = identities[square];
        if (!piece || !id) return null;

        return (
          <ChessPiece3D
            key={id}
            piece={piece}
            square={square}
            isSelected={selected === square}
            isChecked={checkedKing === square}
            onSelect={onSelectSquare}
          />
        );
      })}
    </group>
  );
}

export default function ChessScene({
  state,
  orientation,
  highlights,
  onSelectSquare,
}: ChessSceneProps) {
  return (
    <Canvas
      shadows={{ type: PCFShadowMap }}
      camera={{ position: cameraPositionFor(orientation), fov: CAMERA_FOV }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#070b14']} />

      <ambientLight intensity={0.72} />
      <directionalLight
        position={[6, 12, 8]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-far={40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.06}
      />
      <directionalLight position={[-7, 8, -6]} intensity={0.42} />
      <pointLight position={[0, 7, 0]} intensity={0.35} />

      <FittedOrbitControls />
      <CameraRig orientation={orientation} />
      <CameraFit />

      <Suspense fallback={null}>
        <ChessBoard3D highlights={highlights} onSelectSquare={onSelectSquare} />
        <Pieces state={state} selected={highlights.selected} onSelectSquare={onSelectSquare} />
      </Suspense>
    </Canvas>
  );
}
