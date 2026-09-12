# PlayDeck — Agent & Architecture Guidelines

> **PlayDeck**: A modern game hub where players can discover, choose, and play games, with instant local play today and an architecture primed for real-time multiplayer experiences in the future.

This file is the authoritative reference for AI coding agents (Claude, Cursor, Gemini Antigravity) working in this repository. Keep it strictly updated whenever patterns evolve.

---

## 1. Monorepo Structure & Module Ownership

PlayDeck is organized as a **frontend-first, domain-driven pnpm monorepo**:

```text
playdeck/
├── apps/
│   └── web/                               # Next.js 15 App Router Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── (public)/
│       │   │   │   ├── page.tsx           # Home ("Play Something" + intentional empty shelf)
│       │   │   │   ├── games/
│       │   │   │   │   ├── page.tsx       # Game Discovery catalog (tabs, search, varied cards)
│       │   │   │   │   └── [gameId]/page.tsx # Game Overview shell
│       │   │   │   ├── library/page.tsx   # Player shelf & session history
│       │   │   │   └── profile/page.tsx   # Player identity, avatar & storage diagnostic
│       │   │   ├── play/
│       │   │   │   └── [gameId]/page.tsx  # Game launcher shell & session stage
│       │   │   ├── layout.tsx             # Root layout & theme initialization
│       │   │   └── globals.css            # Arcade theme tokens & CSS variables
│       │   │
│       │   ├── components/
│       │   │   ├── ui/                    # Re-export boundary for @playdeck/ui
│       │   │   ├── layout/                # Navbar, Footer, ThemeToggle
│       │   │   └── game/                  # GameCard, GameAreaShell, EmptyShelf
│       │   │
│       │   ├── features/
│       │   │   ├── games/                 # Services, catalog repository, registry
│       │   │   ├── player/                # Player identity & stats
│       │   │   └── multiplayer/           # Reserved contracts for lobby, room & transport
│       │   │
│       │   ├── lib/
│       │   │   ├── storage/               # Storage abstraction (IndexedDB + LocalStorage)
│       │   │   ├── api/                   # Future API boundary
│       │   │   └── utils/                 # cn, formatting helpers
│       │   │
│       │   ├── data/games/                # Static game definitions & mock registry
│       │   └── stores/                    # Separated Zustand stores
│       │
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── vercel.json
│       └── package.json
│
├── packages/
│   ├── ui/                                # Shared core component design system (@playdeck/ui)
│   ├── game-types/                        # Pure TypeScript domain interfaces
│   ├── game-core/                         # Framework-agnostic session & registry engines
│   └── shared/                            # Zod schemas, validation, ID generators
│
├── public/
├── eslint-rules/                          # Custom monorepo quality & boundary rules
├── pnpm-workspace.yaml
├── AGENTS.md
├── CLAUDE.md
├── .mcp.json
├── lefthook.yml
└── package.json
```

**Rule**: Do NOT put everything inside `components/`. Games, player state, storage, multiplayer, and UI have distinct, isolated ownership.

---

## 2. Core Architectural Principles (CRITICAL)

### Rule 1: Storage Abstraction (NEVER call `localStorage` directly)

- **Never** call `window.localStorage` or `window.indexedDB` directly from feature components or game engines.
- Always access storage via `StorageService` (`apps/web/src/lib/storage/storage.ts`) or implement against `StorageAdapter` (`@playdeck/game-types`).
- **IndexedDB via Dexie** is the primary client storage engine because games store structured sessions, preferences, statistics, and save states.
- When migrating to a remote database (PostgreSQL/Supabase/NestJS), only the adapter or repository changes—never the React components.

```ts
// GOOD:
import { StorageService } from '@/lib/storage/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
await StorageService.set(STORAGE_KEYS.SESSIONS, updatedSessions);

// BAD:
localStorage.setItem('sessions', JSON.stringify(updatedSessions)); // FORBIDDEN
```

### Rule 2: State Separation (NEVER create one monolithic store)

Do **not** create a single giant `useGameStore()` or `useAppStore()`. Separate state into dedicated stores:

1. `stores/player.store.ts`: Active player profile, display name, avatar, win/loss stats.
2. `stores/library.store.ts`: Saved sessions, recent plays, favorites, pinned games.
3. `stores/game-session.store.ts`: Active game session (`waiting` | `playing` | `completed`), score, current turn, pause/resume.
4. `stores/preferences.store.ts`: Theme (`dark` | `light` | `system`), sound FX, reduced motion.
5. `stores/multiplayer.store.ts`: Connection state, room codes, presence (reserved for Phase 2).

### Rule 3: Games as Modular Plugins (Framework-Agnostic)

- Games must adhere to the `GameDefinition` contract defined in `@playdeck/game-types`.
- Game logic (rules, board state, winning conditions) must remain decoupled from React and Next.js.
- Games communicate with the platform via `SessionManager` and `GameSession` state.

```ts
export interface GameDefinition<TState = unknown> {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: GameCategory;
  players: { min: number; max: number };
  status: 'available' | 'coming-soon' | 'maintenance';
  createGame?: () => TState;
}
```

### Rule 4: API Abstraction from Day One

- All game catalog queries run through `GameRepository` (`features/games/services/game-repository.ts`).
- Today: `LocalGameRepository` queries static catalog definitions in `data/games/`.
- Future: `ApiGameRepository` queries the backend API without breaking any UI component.

---

## 3. UI & Design Direction

- **Aesthetic**: Premium arcade / gaming library aesthetic.
- **Palette**: Rich dark canvas (`#090d16`), layered surface elevations (`#111827`, `#1c2438`), warm amber/gold tactical accents (`#f59e0b`), subtle crisp borders (`#232f45`).
- **Avoid**:
  - Generic SaaS layouts (giant bloated marketing hero with generic cards).
  - Excessive floating glassmorphism and purple AI glowing gradients.
  - Making every single section a floating card.
- **Intentional Empty States**:
  When the player has no saved sessions, present the intentional shelf state:
  ```text
                      ✦
            Your game shelf is waiting.
      Games will appear here as they're added.
               [ Explore games ]
  ```
- **Discovery Layouts**:
  Use varied card layouts on `/games` (featured wide hero cards, compact row items, standard arcade cards), not a monotone grid.

---

## 4. Development & Build Commands

Always use `pnpm` inside this repository:

- `pnpm install`: Install and link monorepo packages.
- `pnpm approve-builds --all`: Approve trusted native build scripts (`sharp`, `unrs-resolver`).
- `pnpm dev`: Start Next.js App Router on `http://localhost:3000`.
- `pnpm build`: Build all workspace packages and Next.js production bundles.
- `pnpm lint`: Run ESLint checks.
- `pnpm clean`: Clean all `node_modules` and `.next` caches.

---

## 5. Coding Conventions

- **TypeScript**: Strict mode enabled across all packages. Avoid `any`—use `unknown` or generic type parameters for arbitrary game state (`GameDefinition<TState>`).
- **File Naming**:
  - React components: `PascalCase.tsx` (e.g. `GameCard.tsx`, `EmptyShelf.tsx`).
  - Stores: `name.store.ts` (e.g. `player.store.ts`).
  - Services: `kebab-case.ts` (e.g. `game-repository.ts`).
  - Schemas: `name.schema.ts`.
- **Path Aliases**:
  - `@/*` maps to `apps/web/src/*`.
  - Workspace packages referenced via `@playdeck/ui`, `@playdeck/game-types`, `@playdeck/game-core`, `@playdeck/shared`.

---

## 6. Shared Core Components (`@playdeck/ui`)

All foundational UI primitives live in the shared workspace package `packages/ui` (`@playdeck/ui`):

- `Button` & `IconButton`: Tactile arcade styling with loading states and size variants.
- `Badge`: Category and status indicators with arcade accents.
- `Card`: Multi-part container (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
- `Input`: ForwardRef text input with icon prefix/suffix, error labels, and helper text.
- `Modal`: Accessible dialog shell with backdrop blur and escape-to-close.
- `Tabs`: Arcade styled `Tabs`, `TabList`, `TabTrigger`, `TabContent`.
- `Avatar`: Player avatar with status indicators and fallback.
- `Tooltip`: Hover tooltips.
- `Skeleton`: Loading placeholders.
- `Divider`: Shelf scanline dividers.

Components can be imported across any package or app via:

```ts
import { Button, Card, Badge, Input, Modal, Tabs, Avatar } from '@playdeck/ui';
```

Or inside `apps/web` via the re-export boundary `@/components/ui`.

---

## 7. Git Workflow & Feature Branch Policy (MANDATORY)

> **MANDATORY**: Every piece of work—including new features, bug fixes, refactorings, experiments, and documentation updates—**MUST be developed on a dedicated feature branch**. Direct commits or pushes to `main` are strictly prohibited.

### Branch Naming Conventions

Use descriptive, lowercase branch names with hyphens, prefixed by category:

- `feat/<feature-name>`: New capabilities, game engines, UI features (e.g. `feat/snake-two-player`, `feat/sound-effects`)
- `fix/<issue-name>`: Bug fixes, layout corrections, logic patches (e.g. `fix/snake-canvas-clipping`, `fix/auth-hash-mismatch`)
- `docs/<topic>`: Documentation, architecture updates, guides (e.g. `docs/enforce-feature-branches`)
- `refactor/<scope>`: Code restructuring, cleanups, migrations without feature changes (e.g. `refactor/storage-adapter`)
- `test/<scope>`: Adding or modifying test suites
- `chore/<task>`: Tooling, package dependency updates, CI/CD

### Development Workflow

1. **Branch Off Up-To-Date `main`**:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b <branch-type>/<short-description>
   ```
2. **Implement & Verify Locally**:
   - Verify tests pass: `pnpm test`
   - Verify linting & types: `pnpm lint`
   - Verify build succeeds: `pnpm build`
   - Format codebase: `pnpm format`
3. **Commit with Conventional Messages**:
   - `feat(...)`, `fix(...)`, `docs(...)`, `refactor(...)`, `chore(...)`
4. **Push & Open Pull Request**:
   - Push the branch to `origin/<branch-type>/<short-description>`.
   - Never push or commit directly to `main`.

---

## 8. Code Search & Symbol Navigation (CodeLens)

AI coding agents and developers working in this codebase MUST leverage **CodeLens / Semantic Code Search** for advanced code search and symbol navigation:

- **Symbol Lookup**: Use CodeLens to inspect incoming references, implementation sites, and call hierarchies before making non-trivial modifications.
- **Cross-Package References**: Prefer CodeLens navigation over generic string matching when tracing dependencies across monorepo packages (`@playdeck/game-types`, `@playdeck/game-core`, `@playdeck/ui`, `@playdeck/shared`).
- **Precision Refactoring**: Rely on CodeLens semantic symbol resolution to verify all invocation signatures across React components, Zustand stores, and domain services.
