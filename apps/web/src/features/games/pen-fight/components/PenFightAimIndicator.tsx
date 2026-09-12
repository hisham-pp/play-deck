'use client';

import { Line } from '@react-three/drei';
import React from 'react';
import type { AimPreview } from '../engine/pen-fight-utils';

/** The aim arrow shown while a player is dragging to flick. */
export function PenFightAimIndicator({ aimPreview }: { aimPreview: AimPreview }) {
  return (
    <>
      <Line
        points={[
          [aimPreview.start.x, aimPreview.start.y + 0.02, aimPreview.start.z],
          [aimPreview.end.x, aimPreview.end.y + 0.02, aimPreview.end.z],
        ]}
        color={aimPreview.color}
        lineWidth={3}
      />
      <mesh position={[aimPreview.end.x, aimPreview.end.y + 0.02, aimPreview.end.z]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color={aimPreview.color} />
      </mesh>
    </>
  );
}
