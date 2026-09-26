# PlayDeck — Claude Context & Directives

This file is read by AI tools at the start of every session. Keep it current.

@AGENTS.md

## Critical Architecture & Workflow Invariants

- **Feature Branches (MANDATORY)**: Every task, feature, bugfix, or doc change MUST be developed and committed on a dedicated feature branch (`feat/*`, `fix/*`, `docs/*`, `refactor/*`). Direct commits or pushes to `main` are strictly prohibited.
- **Storage**: Never call `localStorage` or `indexedDB` directly in UI or engine code. Use `StorageService` (`apps/web/src/lib/storage/storage.ts`) with `STORAGE_KEYS`.
- **State**: Keep stores strictly separated (`player.store`, `library.store`, `game-session.store`, `preferences.store`, `multiplayer.store`). No monolithic stores.
- **Game Engine**: Game logic is framework-agnostic and implements `GameDefinition` from `@playdeck/game-types`.
- **API Boundary**: Catalog calls must route through `GameRepository`.
- **Game Pages & SEO**: Every game has one canonical page at `/games/<slug>`. Its copy lives in `@playdeck/game-data` (`packages/game-data/src/content/<slug>.ts`) as `GameContent` — never add a per-game page file. Link with `game.slug`, never `game.id`. See AGENTS.md § Rule 6.
- **Advanced Code Search**: Use **CodeLens** for semantic code search, symbol lookup, and cross-package dependency navigation across the monorepo.

## Commands

- `pnpm dev`: Start local dev server
- `pnpm build`: Production build
- `pnpm lint`: Run linter
- `pnpm approve-builds --all`: Approve build scripts
