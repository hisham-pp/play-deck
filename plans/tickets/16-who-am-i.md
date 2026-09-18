## Who Am I?

Create a classic social deduction party game "Who Am I?" for Play Deck.

Players: 3-8

CORE CONCEPT
Everyone gets a hidden identity assigned to them — visible to all
OTHER players but NOT to themselves. Ask yes/no questions to
discover your own identity.

GAMEPLAY

- Each player is assigned a character/person/thing identity.
- The identity is displayed above the player's avatar for everyone EXCEPT the player themselves.
- On your turn, ask one yes/no question to the group.
- Other players answer honestly.
- After the Q&A, you can guess your identity or pass.
- Correct guess = you win the round (or earn points).
- Incorrect guess = penalty (skip a turn or lose points).
- Continue until all players guess correctly or time runs out.

IDENTITY CATEGORIES

- Famous people
- Animals
- Movie characters
- Professions
- Objects
- Historical figures
- Custom (players submit identities)

VOICE INTEGRATION
This game is primarily voice-driven.
Questions, answers, and hilarious wrong guesses.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Category selection → Identity assignment → Rounds (ask + guess) → Results.

UI
Show:

- Other players' identities (visible to you)
- Your identity: "???" (hidden from you)
- Question/answer history
- Current player turn
- Guess input
- Timer
- Voice status

VISUAL STYLE

- Clean party game aesthetic.
- Identity cards with illustrations.
- Mystery question mark for your own identity.
- Satisfying correct guess reveal.

TECHNICAL

- Server assigns identities; NEVER send a player their own identity.
- Separate: Identity system, Q&A tracking, scoring, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 16: Who Am I?)
