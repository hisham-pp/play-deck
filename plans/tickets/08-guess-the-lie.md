## Guess the Lie

Create a social deduction party game called "Guess the Lie" for Play Deck.

Players: 3-8

CORE CONCEPT
Each round, a prompt appears. All players submit answers.
One answer is deliberately fake. Everyone tries to identify the lie.

GAMEPLAY

- A prompt appears (e.g., "Name a country in Asia" or "What did you eat for breakfast?").
- All players except one answer truthfully.
- One designated player submits a believable lie.
- All answers are displayed anonymously.
- Players discuss via voice and vote on which answer is the lie.
- Points for correctly identifying the lie.
- Points for the liar if they fool the majority.

PROMPT TYPES

- Factual: "Name a capital city" (liar submits a fake one).
- Personal: "What's your favorite movie?" (liar makes something up).
- Creative: "Describe your dream vacation" (liar invents a story).
- Trivia: "What year was X invented?" (liar picks a wrong year).

VOICE INTEGRATION
Discussion after answers are revealed is where the game shines.
Players argue, defend, and accuse.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Prompt → Submit answers → Reveal answers → Discussion → Vote → Reveal liar → Score → Next round.

UI
Show:

- Prompt
- Answer input
- All submitted answers (anonymous)
- Vote interface
- Discussion timer
- Player scores
- Voice status

VISUAL STYLE

- Clean quiz-show aesthetic.
- Anonymous answer cards.
- Dramatic liar reveal animation.
- Voting animation.
- Score celebrations.

ACCESSIBILITY

- Keyboard text input.
- Touch-friendly voting.
- Screen-reader answer reading.
- High contrast, reduced motion.

TECHNICAL

- Server assigns liar role secretly.
- Shuffle answer display order server-side.
- Separate: Prompt system, role assignment, answer collection, voting, scoring, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 8: Guess the Lie)
