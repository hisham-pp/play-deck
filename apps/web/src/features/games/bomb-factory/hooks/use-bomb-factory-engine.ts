'use client';

import { useEffect, useRef, useState } from 'react';
import { BombFactoryEngine } from '../engine/bomb-factory-engine';
import type { BombFactoryState } from '../types/bomb-factory.types';

export interface UseBombFactoryEngineReturn {
  engine: BombFactoryEngine;
  state: BombFactoryState;
}

export function useBombFactoryEngine(): UseBombFactoryEngineReturn {
  const engineRef = useRef<BombFactoryEngine | null>(null);
  if (!engineRef.current) engineRef.current = new BombFactoryEngine();

  const [state, setState] = useState<BombFactoryState>(() => engineRef.current!.getState());

  useEffect(() => {
    const engine = engineRef.current!;
    const unsubscribe = engine.subscribe(setState);
    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, []);

  return { engine: engineRef.current, state };
}
