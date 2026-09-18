## Telephone Drawing

Create a hilarious chain party game called "Telephone Drawing" for Play Deck.

Players: 4-8

CORE CONCEPT
Player A gets a phrase → draws it → Player B describes the drawing →
Player C draws that description → chain continues → final result is
compared with the original phrase.

GAMEPLAY

- Player 1 receives a secret phrase.
- Player 1 draws the phrase (timed).
- Player 2 sees ONLY the drawing and writes a description.
- Player 3 sees ONLY the description and draws it.
- Player 4 sees ONLY the drawing and writes a description.
- Continue until all players have participated.
- At the end, reveal the entire chain: original phrase → all drawings and descriptions.
- Players vote on the funniest mutation.

DRAWING TOOLS

- Pencil, eraser, color palette, brush sizes, clear, undo.
- Keep tools simple to encourage fast, imperfect drawings.

CHAIN LENGTH

- Short chains: 4 players.
- Long chains: 6-8 players.
- Multiple simultaneous chains in larger groups.

SCORING

- Votes for funniest chain moment.
- Accuracy bonus if the final description matches the original.
- "Best Artist" and "Worst Artist" awards.

VOICE INTEGRATION
The reveal phase is where voice shines — laughing at how the message mutated.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Phrase assignment → Draw/describe chain → Full chain reveal → Voting → Scores.

UI
Draw phase:

- Canvas with drawing tools
- Timer

Describe phase:

- Previous drawing displayed
- Text input for description
- Timer

Reveal phase:

- Full chain displayed step by step
- Vote interface
- Scores

VISUAL STYLE

- Fun sketchbook aesthetic.
- Step-by-step chain reveal animation.
- Side-by-side original vs final comparison.
- Playful, colorful presentation.

ACCESSIBILITY

- Touch and mouse drawing.
- Keyboard text input.
- Screen-reader description reading.
- High contrast, reduced motion.

TECHNICAL

- Each step is private; NEVER show future/past chain steps to current player.
- Use compact stroke protocol for drawing sync.
- Separate: Drawing engine, description system, chain management, reveal system, voting, scoring, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 10: Telephone Drawing)
