## Shared Brain

Create a cooperative chaos game called "Shared Brain" for Play Deck.

Players: 2-6 (paired)

CORE CONCEPT
Two players control the same character, each controlling different
abilities. Voice communication is essential — without it, the
character is helpless.

GAMEPLAY

- Players are paired. Each pair controls ONE character.
- Player A controls: horizontal movement (left/right).
- Player B controls: vertical movement (jump) and actions (interact, attack).
- Neither player can do the other's actions.
- Together they must navigate obstacle courses, solve puzzles, or compete against other pairs.
- Communication via voice is the ONLY way to coordinate.
- "Go right! Jump NOW! Wait, go back!"

GAME MODES

- Co-op Course: pairs navigate an obstacle course together.
- Race: pairs race against other pairs.
- Puzzle: pairs solve cooperative puzzles.
- Battle: pairs fight other pairs.

CONTROL SPLIT OPTIONS

- Movement / Actions
- Left hand / Right hand
- Offense / Defense
- Navigate / Build

VOICE INTEGRATION
THIS IS THE CORE MECHANIC.
Without voice communication, the character cannot function.
Players must constantly talk, coordinate, and react.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Pair assignment → Control assignment → Countdown → Play → Results → Swap controls.

UI
Show:

- Which controls YOU have
- Which controls your PARTNER has
- Course/puzzle/arena
- Timer
- Score
- Voice status (critical)

VISUAL STYLE

- Colorful, chaotic platformer/puzzle aesthetic.
- Split-color character (half player A's color, half player B's).
- Clear control indicators.
- Fun failure animations.
- Celebration for successful coordination.

ACCESSIBILITY

- Simple controls (each player has minimal buttons).
- Clear visual indicators for whose control is active.
- Text chat alternative (though voice is strongly recommended).
- High contrast, reduced motion.

TECHNICAL

- Server validates that each player can only use their assigned controls.
- Separate: Character controller (split), course/puzzle design, control assignment, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 21: Shared Brain)
