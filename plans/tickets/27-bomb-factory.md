## Bomb Factory

Create a cooperative puzzle game called "Bomb Factory" for Play Deck.

Players: 2-6

CORE CONCEPT
Players collaboratively assemble machines under time pressure,
but each player sees different information.

GAMEPLAY

- A machine blueprint is split across all players.
- Each player sees ONLY their portion of the instructions.
- Players must communicate via voice to assemble the complete machine.
- Steps must be completed in order.
- Wrong assembly = time penalty.
- Complete the machine before the timer to win.
- Multiple machines with increasing complexity.

INFORMATION SPLIT

- Player A: knows the order of operations.
- Player B: knows which parts go where.
- Player C: knows the correct settings/configurations.
- Player D: knows the safety constraints (what NOT to do).

VOICE INTEGRATION
This game REQUIRES voice communication to function.
No player has complete information.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Difficulty selection → Information distribution → Assembly phase → Result → Next machine.

VISUAL STYLE

- Industrial factory aesthetic.
- Clear machine components.
- Timer urgency effects.
- Satisfying assembly animations.
- Dramatic success/failure sequence.

TECHNICAL

- Each player's view is different; NEVER send complete instructions to one client.
- Separate: Blueprint system, assembly validator, information splitter, timer, scoring, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 27: Bomb Factory)
