'use client';

import React from 'react';

export function ArenaLighting() {
  return (
    <>
      <color attach="background" args={['#05070c']} />
      <fog attach="fog" args={['#05070c', 7, 15]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[3.5, 6, 3]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={14}
      />
      <directionalLight position={[-3, 3, -3.5]} intensity={0.35} color="#8ab4ff" />
      <pointLight position={[0, 2.6, 0]} intensity={0.4} color="#f59e0b" distance={8} />
    </>
  );
}
