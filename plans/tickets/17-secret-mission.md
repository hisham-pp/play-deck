## Secret Mission

Create a stealth social game called "Secret Mission" for Play Deck.

Players: 3-8

CORE CONCEPT
Every player receives a secret objective. Complete yours without
revealing it to everyone else.

GAMEPLAY

- All players are in a shared environment (virtual room, grid, or activity).
- Each player receives a unique secret mission.
- Missions require specific actions: "High-five 3 different players," "Stand in the corner for 10 seconds," "Collect 5 blue items," "Make someone laugh on voice chat."
- Players perform actions while trying to be subtle.
- Other players can accuse someone of completing their mission.
- Successful accusation: accuser gets bonus points, caught player loses bonus.
- Mission completion without being caught: maximum points.

MISSION TYPES

- Physical: move to specific locations, collect items.
- Social: interact with specific players, say certain phrases.
- Behavioral: act a certain way, avoid certain actions.
- Meta: related to the game itself (be the last to vote, etc.).

VOICE INTEGRATION
Social missions that require voice interaction.
Accusing other players of suspicious behavior.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Mission assignment → Free play phase → Accusation rounds → Reveal → Scores.

VISUAL STYLE

- Spy/secret agent aesthetic.
- Mission briefing animation.
- Subtle completion indicators (player-only).
- Dramatic reveal sequence.

TECHNICAL

- Server-authoritative mission assignment and validation.
- Track player actions server-side.
- NEVER reveal missions to other clients.
- Separate: Mission system, action tracker, accusation system, scoring, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 17: Secret Mission)
