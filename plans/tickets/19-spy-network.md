## Spy Network

Create a deduction game called "Spy Network" for Play Deck.

Players: 4-8

CORE CONCEPT
Players exchange clues and information while trying to determine
which player is the spy. The spy tries to blend in while gathering intel.

GAMEPLAY

- All players receive a shared location/theme (e.g., "Beach").
- One player (the Spy) does NOT know the location.
- Players take turns asking each other questions about the location.
- Questions should be vague enough that the Spy can fake answers.
- But specific enough that other players can verify authenticity.
- After Q&A rounds, players vote on who the Spy is.
- The Spy can guess the location at any time for bonus points.

VOICE INTEGRATION
Questioning, evasion, and accusation are entirely voice-driven.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Location assignment → Q&A rounds → Discussion → Vote → Reveal → Scores.

VISUAL STYLE

- Espionage aesthetic.
- Dossier-style player cards.
- Tense atmosphere.
- Dramatic reveal.

TECHNICAL

- Server assigns location to all except Spy.
- NEVER send location to Spy client.
- Separate: Location system, role assignment, Q&A tracking, voting, scoring, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 19: Spy Network)
