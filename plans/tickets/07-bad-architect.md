## Bad Architect

Create a hilarious party game called "Bad Architect" for Play Deck.

Players: 3-8

CORE CONCEPT
One player sees a target structure or image. Everyone else must
build/draw it based ONLY on that player's verbal instructions.
At the end, reveal the reference and compare the results.

GAMEPLAY

- One player is the Architect. They see a reference image/structure.
- Other players have a building canvas (grid-based block placement or drawing tool).
- The Architect describes the structure using only voice.
- The Architect CANNOT see what others are building.
- Builders CANNOT see the reference.
- Timer limits the build phase.
- When time ends, all builds are revealed alongside the reference.
- Players vote on the closest match and the funniest attempt.

REFERENCE TYPES

- Simple geometric arrangements.
- Pixel art patterns.
- Abstract shapes.
- Recognizable objects (house, car, animal).
- Increasingly complex references as rounds progress.

SCORING

- Similarity score (algorithmic comparison for grid builds).
- Vote-based: "Closest Match" and "Funniest Disaster" awards.
- Architect earns points based on average similarity.

VOICE INTEGRATION
Voice is THE core mechanic. The Architect must describe using only words.
Miscommunication IS the game.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Architect selection → Reference shown (to Architect only) → Build phase (voice only) → Reveal + compare → Vote → Rotate Architect → Next round.

UI
Architect view:

- Reference image
- Timer
- "Builders cannot see this" reminder

Builder view:

- Building canvas (grid or drawing)
- Tools (block placement, colors, eraser)
- Timer
- "Listen to the Architect" prompt

Reveal view:

- Side-by-side: reference vs all builds
- Vote interface
- Scores

VISUAL STYLE

- Fun workshop/construction aesthetic.
- Clean building grid.
- Dramatic reveal animation (curtain pull).
- Side-by-side comparison layout.
- Playful, colorful blocks.

ACCESSIBILITY

- Keyboard grid navigation.
- Touch block placement.
- Text chat fallback for Architect.
- Screen-reader grid position announcements.
- High contrast, reduced motion.

TECHNICAL

- Server holds reference image; NEVER send to builder clients.
- Separate: Reference system, building canvas, similarity scoring, voting, turn management, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 7: Bad Architect)
