# Adding a New Game to PlayDeck

> Complete developer guide for adding games to the PlayDeck monorepo using our modular plugin architecture and framework-agnostic engine patterns.

---

## 1. Overview of the Architecture

PlayDeck is designed so that adding any game requires **zero modification to unrelated platform shells**. Every game consists of:

1. **Domain Contract**: Entry in `apps/web/src/data/games/` typed as `GameDefinition` with metadata, player capacity, controls, and difficulty presets.
2. **Game Engine**: A pure TypeScript simulation engine (in `apps/web/src/features/games/<game-id>/engine/`).
3. **React Arcade Shell**: UI component wrapped with platform hooks (`useGameLifecycle`, `useGameSessionStore`, `usePlayerStore`).
4. **Editorial & SEO Content**: `apps/web/src/data/games/content/<slug>.ts` typed as `GameContent` (for playable titles).
5. **Launcher Registration**: Single key addition in `GAME_COMPONENTS` inside `apps/web/src/components/game/GameAreaShell.tsx`.

---

## 2. Step-by-Step Implementation Workflow

### Step 1: Define Game Metadata

Register the game definition in `apps/web/src/data/games/available-games-1.ts` (or appropriate file):

```typescript
import { GameDefinition } from '@playdeck/game-types';

export const MY_GAME: GameDefinition = {
  id: 'my-game',
  name: 'My Arcade Game',
  slug: 'my-game',
  description: 'Fast-paced arcade adventure with high-score chasing.',
  category: 'arcade',
  players: { min: 1, max: 2 },
  status: 'available', // or 'coming-soon'
  thumbnailUrl: '/games/my-game/icon.svg',
  bannerUrl: '/games/my-game/cover.svg',
  tags: ['Action', 'Arcade', 'High Score'],
  badge: 'Ready to Play',
  controls: [
    { action: 'Move', key: 'WASD / Arrow Keys', touchAction: 'On-screen Joystick' },
    { action: 'Action', key: 'Space', touchAction: 'Tap Action Button' },
  ],
  difficultyPresets: ['easy', 'normal', 'hard'],
};
```

### Step 2: Implement the Game Engine (Framework-Agnostic)

Create pure TypeScript logic decoupled from React:
`apps/web/src/features/games/my-game/engine/my-game-engine.ts`

```typescript
export interface MyGameState {
  score: number;
  isGameOver: boolean;
  // ... your game state
}

export function createInitialState(): MyGameState {
  return { score: 0, isGameOver: false };
}

export function updateGameState(state: MyGameState, deltaMs: number): MyGameState {
  // Pure update loop
  return { ...state };
}
```

### Step 3: Implement the UI Component with `useGameLifecycle`

Use the standardized lifecycle hook `useGameLifecycle` from `@/features/games/hooks/use-game-lifecycle`:

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { useGameLifecycle, useGameLoop } from '@/features/games/hooks/use-game-lifecycle';
import { usePlayerStore } from '@/stores/player.store';

export function MyGame() {
  const { recordGamePlayed } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    status,
    score,
    highScore,
    isPlaying,
    isPaused,
    isGameOver,
    startGame,
    togglePause,
    restartGame,
    finishGame,
    setScore,
  } = useGameLifecycle({
    onGameOver: (payload) => {
      recordGamePlayed(payload.score > 0, 'arcade', 'my-game', payload.score);
    },
  });

  // Safe requestAnimationFrame loop with automatic delta time calculation
  useGameLoop(
    (deltaMs) => {
      // Render frame to canvas or update state
    },
    { isRunning: isPlaying },
  );

  return (
    <div className="relative w-full aspect-[16/9] bg-slate-950 rounded-2xl overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* HUD, pause overlay, start overlays */}
    </div>
  );
}
```

### Step 4: Register in `GameAreaShell`

Add one entry to `GAME_COMPONENTS` in `apps/web/src/components/game/GameAreaShell.tsx`:

```typescript
import { MyGame } from '@/features/games/my-game';

const GAME_COMPONENTS: Record<string, React.ComponentType> = {
  // ...
  'my-game': MyGame,
};
```

### Step 5: Add Editorial SEO Content (for Playable Games)

Create `apps/web/src/data/games/content/my-game.ts` typed as `GameContent`:

- Title, meta description (within 120-160 characters)
- Overview, how-to-play steps, rules, controls table, tips, and FAQ items
- Register in `data/games/content/index.ts`

---

## 3. Architecture Rules to Remember

1. **Storage Rule**: Never call `localStorage` directly. Progression and best scores are automatically recorded via `usePlayerStore().recordGamePlayed(...)`.
2. **Slug is Canonical**: Always route and link with `game.slug`.
3. **Accessibility**: Provide keyboard listeners (Pause on `Esc`/`P`, Restart on `R`), visible focus rings, and touch button alternatives for mobile.
4. **Testing**: Write unit tests for engines using `node:test` (`*.test.ts`). Run `pnpm test` to verify.
