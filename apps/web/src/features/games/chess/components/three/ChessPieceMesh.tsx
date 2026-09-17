'use client';

import { useMemo, type ReactElement } from 'react';
import { Shape, type Material } from 'three';
import type { PieceType } from '../../types/chess.types';

/**
 * Pieces are built from primitives rather than loaded models, so the set ships
 * with no assets and stays legible at the size a whole board forces.
 *
 * Each piece shares one material instance, handed down from the caller, so
 * colour, selection glow and transparency are decided in one place.
 */
interface ShapeProps {
  material: Material;
}

const CROWN_POINTS = 8;
const KNIGHT_DEPTH = 0.15;

function Base({ material }: ShapeProps) {
  return (
    <>
      <mesh position={[0, 0.03, 0]} material={material} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.23, 0.06, 28]} />
      </mesh>
      <mesh position={[0, 0.075, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.165, 0.2, 0.04, 28]} />
      </mesh>
    </>
  );
}

function Collar({ material, y, radius }: ShapeProps & { y: number; radius: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={material} castShadow>
      <torusGeometry args={[radius, 0.028, 10, 24]} />
    </mesh>
  );
}

function Pawn({ material }: ShapeProps) {
  return (
    <>
      <Base material={material} />
      <mesh position={[0, 0.21, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.075, 0.13, 0.23, 24]} />
      </mesh>
      <mesh position={[0, 0.34, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.1, 0.085, 0.035, 24]} />
      </mesh>
      <mesh position={[0, 0.43, 0]} material={material} castShadow>
        <sphereGeometry args={[0.098, 20, 16]} />
      </mesh>
    </>
  );
}

function Rook({ material }: ShapeProps) {
  return (
    <>
      <Base material={material} />
      <mesh position={[0, 0.26, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.135, 0.155, 0.33, 24]} />
      </mesh>
      <mesh position={[0, 0.45, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.175, 0.155, 0.07, 24]} />
      </mesh>
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.13, 0.53, Math.sin(angle) * 0.13]}
            rotation={[0, -angle, 0]}
            material={material}
            castShadow
          >
            <boxGeometry args={[0.07, 0.1, 0.07]} />
          </mesh>
        );
      })}
    </>
  );
}

function Bishop({ material }: ShapeProps) {
  return (
    <>
      <Base material={material} />
      <mesh position={[0, 0.26, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.082, 0.14, 0.33, 24]} />
      </mesh>
      <Collar material={material} y={0.43} radius={0.097} />
      <mesh position={[0, 0.53, 0]} material={material} castShadow>
        <sphereGeometry args={[0.112, 20, 16]} />
      </mesh>
      <mesh position={[0, 0.64, 0]} material={material} castShadow>
        <coneGeometry args={[0.07, 0.13, 20]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} material={material} castShadow>
        <sphereGeometry args={[0.042, 14, 12]} />
      </mesh>
    </>
  );
}

function Queen({ material }: ShapeProps) {
  return (
    <>
      <Base material={material} />
      <mesh position={[0, 0.29, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.095, 0.155, 0.39, 24]} />
      </mesh>
      <Collar material={material} y={0.49} radius={0.112} />
      <mesh position={[0, 0.6, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.145, 0.1, 0.11, 24]} />
      </mesh>
      {Array.from({ length: CROWN_POINTS }, (_, index) => {
        const angle = (index / CROWN_POINTS) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 0.125, 0.69, Math.sin(angle) * 0.125]}
            material={material}
            castShadow
          >
            <sphereGeometry args={[0.037, 12, 10]} />
          </mesh>
        );
      })}
      <mesh position={[0, 0.71, 0]} material={material} castShadow>
        <sphereGeometry args={[0.055, 16, 14]} />
      </mesh>
    </>
  );
}

function King({ material }: ShapeProps) {
  return (
    <>
      <Base material={material} />
      <mesh position={[0, 0.31, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 0.43, 24]} />
      </mesh>
      <Collar material={material} y={0.53} radius={0.117} />
      <mesh position={[0, 0.64, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.14, 0.105, 0.12, 24]} />
      </mesh>
      <mesh position={[0, 0.79, 0]} material={material} castShadow>
        <boxGeometry args={[0.048, 0.2, 0.048]} />
      </mesh>
      <mesh position={[0, 0.82, 0]} material={material} castShadow>
        <boxGeometry args={[0.13, 0.048, 0.048]} />
      </mesh>
    </>
  );
}

/**
 * The knight is the one piece primitives cannot fake, so its head is an
 * extruded silhouette, which is how a real set reads from the side too. The
 * muzzle is drawn towards +x, and the group turns it to face down the board.
 */
function useKnightSilhouette(): Shape {
  return useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-0.17, 0);
    shape.lineTo(0.17, 0);
    shape.lineTo(0.14, 0.13);
    shape.quadraticCurveTo(0.09, 0.25, 0.03, 0.31);
    shape.quadraticCurveTo(0.13, 0.35, 0.2, 0.43);
    shape.lineTo(0.23, 0.51);
    shape.lineTo(0.12, 0.53);
    shape.lineTo(0.07, 0.62);
    shape.lineTo(0.02, 0.53);
    shape.lineTo(-0.05, 0.61);
    shape.lineTo(-0.08, 0.51);
    shape.quadraticCurveTo(-0.21, 0.45, -0.2, 0.29);
    shape.quadraticCurveTo(-0.21, 0.14, -0.17, 0);
    shape.closePath();
    return shape;
  }, []);
}

function Knight({ material }: ShapeProps) {
  const silhouette = useKnightSilhouette();

  return (
    <>
      <Base material={material} />
      <mesh position={[0, 0.16, 0]} material={material} castShadow>
        <cylinderGeometry args={[0.14, 0.16, 0.14, 24]} />
      </mesh>
      {/*
        Rotating a quarter turn about y sends the silhouette's +x (the muzzle)
        to -z, which is down the board. The x offset re-centres the extrusion,
        which otherwise grows from the shape plane in one direction only.
      */}
      <group position={[-KNIGHT_DEPTH / 2, 0.2, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.82}>
        <mesh material={material} castShadow>
          <extrudeGeometry
            args={[
              silhouette,
              {
                depth: KNIGHT_DEPTH,
                bevelEnabled: true,
                bevelSize: 0.014,
                bevelThickness: 0.014,
                bevelSegments: 2,
                curveSegments: 12,
              },
            ]}
          />
        </mesh>
      </group>
    </>
  );
}

const PIECE_SHAPES: Record<PieceType, (props: ShapeProps) => ReactElement> = {
  p: Pawn,
  n: Knight,
  b: Bishop,
  r: Rook,
  q: Queen,
  k: King,
};

export interface ChessPieceMeshProps {
  type: PieceType;
  material: Material;
}

/** Draws the body of a piece. Position and facing belong to the caller. */
export function ChessPieceMesh({ type, material }: ChessPieceMeshProps) {
  const Piece = PIECE_SHAPES[type];
  return <Piece material={material} />;
}
