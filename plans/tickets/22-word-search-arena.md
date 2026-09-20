# Ticket 22: Word Search Arena — Multiplayer Word Hunt

## Issue Reference

GitHub Issue #54: `feat(game): Word Search Arena — Multiplayer Word Hunt`

## Overview

Fast-paced multiplayer word search game. Players compete to find hidden words in a shared letter grid by clicking/dragging across letters. The first player to discover and claim a word scores it with color highlighting. Features multiple curated themes, grid sizes, bot players, and integrated WebRTC voice chat.

## Acceptance Criteria

- [ ] Framework-agnostic grid generator with 8-directional word placement (Horizontal, Vertical, Diagonal forward/backward) and fill letters.
- [ ] Grid sizes: Small (10×10), Medium (12×12 or 15×15), Large (16×16).
- [ ] Themed word decks: Animals, Countries, Food, Science, Sports, Mixed.
- [ ] Interactive click/drag selection engine with path straightness check (H, V, Diagonal).
- [ ] Word claim synchronization: First player to claim a word scores it and highlights with player avatar/color.
- [ ] Scoring: Word length points + speed bonus.
- [ ] Modes: Solo, Race, Elimination, Teams.
- [ ] AI Bot opponents with simulated search delay and claim capability for offline/solo play.
- [ ] Web Audio sound effects (select, word found, invalid, win/finish).
- [ ] Dedicated Zustand store (`stores/word-search-multiplayer.store.ts`).
- [ ] Full WebRTC mesh voice dock (`<RoomVoiceDock />`) for multiplayer lobbies.
- [ ] Rule 6 compliant SEO content module (`apps/web/src/data/games/content/word-search-arena.ts`).
- [ ] Catalog registration in available games and removal from coming soon.
- [ ] Unit test suite covering grid generation, 8-directional word placement, path selection, and scoring.
- [ ] 0 ESLint errors, clean prettier formatting, passing unit tests, and successful `pnpm build`.
