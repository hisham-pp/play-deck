# PlayDeck

> A modern game hub where players can discover, choose, and play different games, with support for local play today and multiplayer experiences in the future.

---

## Architecture Overview

PlayDeck is designed as a **frontend-first, domain-driven Next.js monorepo** using `pnpm`:

```text
playdeck/
├── apps/
│   └── web/                   # Next.js 15 App Router application
├── packages/
│   ├── ui/                    # Shared core component design system (@playdeck/ui)
│   ├── game-types/            # Pure TypeScript domain interfaces
│   ├── game-core/             # Abstract game engine & session lifecycle
│   └── shared/                # Zod schemas and validation
├── AGENTS.md                  # Comprehensive AI agent & architecture handbook
├── CLAUDE.md                  # Quick reference directives
└── .mcp.json                  # MCP tool configuration
```

### Key Highlights

1. **Clean Storage Abstraction**: IndexedDB via Dexie is the primary client storage adapter, exposed behind a unified `StorageAdapter` interface. Zero hardcoded `localStorage` calls.
2. **Modular Game Registry**: Games are plugins conforming to the `GameDefinition` contract. Game rules do not depend on React.
3. **Decoupled State Management**: Five specialized Zustand stores (`player`, `library`, `game-session`, `preferences`, `multiplayer`).
4. **Arcade/Library Aesthetic**: Tactile design system with dark/light themes, subtle textures, varied card layouts, and an intentional empty shelf state.
5. **Multiplayer Reserved**: Lobby, room, and transport contracts reserved for Phase 2 WebSockets/WebRTC integration without requiring frontend rewrites.

---

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 10

### Installation

```bash
# Clone the repository and install dependencies
pnpm install

# Approve native build scripts if prompted
pnpm approve-builds --all

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Deployment (Vercel)

PlayDeck is pre-configured for zero-friction Vercel deployments:

1. **Import Repository**: In the Vercel Dashboard, import the repository.
2. **Preset**: Vercel automatically detects Next.js.
3. **Configuration**:
   - **From Monorepo Root (Recommended)**: The root `vercel.json` automatically manages build and output directory (`apps/web/.next`).
   - **Alternative (Root Directory = `apps/web`)**: If configuring `apps/web` as the root directory in project settings, `apps/web/vercel.json` provides seamless fallback.
4. **Deploy**: Click **Deploy**. No special environment variables are required for base local play.

---

## Available Scripts

- `pnpm dev`: Starts the Next.js development server.
- `pnpm build`: Builds all workspace packages and production bundle.
- `pnpm lint`: Runs ESLint across all files.
- `pnpm format`: Runs Prettier to format the codebase.
- `pnpm clean`: Cleans build artifacts and caches.

---

## Roadmap

- [x] **Phase 1 (V1 Foundation)**: Clean architecture, monorepo, storage abstraction, responsive gaming library UI, session manager, player identity, AGENTS.md.
- [ ] **Phase 2 (Game Plugins)**: First fully playable local games (Tic-Tac-Toe, Cyber Snake, Master Chess).
- [ ] **Phase 3 (Multiplayer)**: Room matchmaking, WebRTC/WebSocket real-time sessions, persistent leaderboards.
