# PlayDeck — Claude Context & Directives

This file is read by AI tools at the start of every session. Keep it current.

@AGENTS.md

## Critical Architecture Invariants

- **Storage**: Never call `localStorage` or `indexedDB` directly in UI or engine code. Use `StorageService` (`apps/web/lib/storage/storage.ts`) with `STORAGE_KEYS`.
- **State**: Keep stores strictly separated (`player.store`, `library.store`, `game-session.store`, `preferences.store`, `multiplayer.store`). No monolithic stores.
- **Game Engine**: Game logic is framework-agnostic and implements `GameDefinition` from `@playdeck/game-types`.
- **API Boundary**: Catalog calls must route through `GameRepository`.

## Commands

- `pnpm dev`: Start local dev server
- `pnpm build`: Production build
- `pnpm lint`: Run linter
- `pnpm approve-builds --all`: Approve build scripts
