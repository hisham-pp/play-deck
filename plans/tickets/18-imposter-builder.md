## Imposter Builder

Create a social deduction building game called "Imposter Builder" for Play Deck.

Players: 4-8

CORE CONCEPT
Everyone receives instructions to build the same object, except one
player receives subtly different instructions. After the build,
everyone votes on who the imposter is.

GAMEPLAY

- All players receive building instructions (e.g., "Build a house with a red roof").
- One player (the Imposter) receives slightly different instructions (e.g., "Build a house with a blue roof").
- Players build on their own canvas (grid-based block placement).
- During building, players can chat via voice but CANNOT see each other's builds.
- After building, all builds are revealed simultaneously.
- Players discuss which build looks different.
- Vote on who the Imposter is.
- Imposter wins if they avoid detection.
- Others win if they correctly identify the Imposter.

INSTRUCTION DIFFERENCES

- Color changes (red → blue)
- Shape differences (square → circle)
- Missing elements (no chimney)
- Extra elements (add a fence)
- Size differences (tall → short)
- Difficulty scales: obvious → extremely subtle differences.

VOICE INTEGRATION
Discussion phase is where deception happens.
The Imposter must lie about their instructions convincingly.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Instruction assignment → Build phase → Reveal → Discussion → Vote → Imposter reveal → Scores.

UI
Build phase:

- Building canvas (grid)
- Your instructions (private)
- Building tools
- Timer

Reveal phase:

- All builds displayed simultaneously
- Player labels
- Discussion timer

Vote phase:

- Vote interface
- Voice status

VISUAL STYLE

- Clean workshop aesthetic.
- Colorful building blocks.
- Dramatic simultaneous reveal.
- Side-by-side comparison view.
- Detective/mystery vote theme.

TECHNICAL

- Server assigns instructions; Imposter gets different version.
- NEVER reveal instruction differences to clients.
- Separate: Instruction generator, building canvas, reveal system, voting, scoring, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 18: Imposter Builder)
