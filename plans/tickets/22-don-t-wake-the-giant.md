## Don't Wake the Giant

Create a cooperative stealth party game called "Don't Wake the Giant" for Play Deck.

Players: 3-6

CORE CONCEPT
Players cooperate to collect treasure around a sleeping giant.
Every action increases a noise meter. If the noise meter fills,
the giant wakes and everyone loses.

GAMEPLAY

- A 2D map with a sleeping giant in the center.
- Treasure is scattered around the map.
- Players move around collecting treasure.
- Every action generates noise: moving, collecting, bumping into objects.
- A shared noise meter is visible to all players.
- When the noise meter reaches certain thresholds, the giant stirs (warning).
- If the noise meter fills completely, the giant wakes and ALL players lose.
- Players must coordinate to minimize total noise.
- "Quiet zones" temporarily reduce noise generation.
- Certain treasures are worth more but make more noise.

NOISE SOURCES

- Walking: low noise.
- Running: medium noise.
- Collecting treasure: noise varies by value.
- Bumping into objects/walls: high noise.
- Two players colliding: high noise.
- Power-ups can reduce or increase noise.

GIANT BEHAVIOR

- Sleeping: normal play.
- Stirring: noise meter at 50% — giant shifts, some paths change.
- Restless: noise meter at 75% — giant moves limbs, creates hazards.
- Waking: noise meter at 100% — GAME OVER for everyone.

VOICE INTEGRATION
Players need to coordinate movement to avoid noise collisions.
Voice itself doesn't affect the game, but whispered coordination
creates hilarious tension.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Map selection → Countdown → Stealth collection → Escape phase → Results.

UI
Show:

- Map with giant
- Noise meter (shared)
- Collected treasure
- Player positions
- Giant status indicator
- Voice status

VISUAL STYLE

- Dark, atmospheric fairy-tale aesthetic.
- Sleeping giant with breathing animation.
- Glowing treasure.
- Noise ripple effects when actions generate sound.
- Tense stirring animations.
- Dramatic wake-up sequence.

ACCESSIBILITY

- Keyboard + touch movement.
- Clear noise meter visualization.
- Visual giant status indicators.
- High contrast, reduced motion.

TECHNICAL
Separate: Giant AI (sleep phases), noise system, treasure placement, player movement, collision, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 22: Don't Wake the Giant)
