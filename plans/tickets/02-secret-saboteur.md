## Secret Saboteur

Create a hidden-role cooperative game called "Secret Saboteur" for Play Deck.

Players: 4-8

CORE CONCEPT
All players share a common objective, but one hidden saboteur secretly
tries to make the team fail without being caught.

GAMEPLAY

- At the start, one player is secretly assigned the Saboteur role.
- The team works toward a shared goal (e.g., building a path, solving a puzzle, collecting resources).
- Each round, players take actions that contribute to (or subtly hinder) the goal.
- The Saboteur can play bad cards, misdirect, or waste resources.
- After each round, players discuss and can call a vote to identify the Saboteur.
- If the team completes the objective, the team wins (unless the Saboteur escapes).
- If the Saboteur prevents completion, the Saboteur wins.
- If the team correctly identifies the Saboteur mid-game, the team gets a bonus.

ROLE SYSTEM

- Worker: contributes to the goal.
- Saboteur: secretly undermines progress.
- Optional: Inspector — can secretly check one player's role per round.

VOICE INTEGRATION
Voice chat is essential for accusations, deflection, and coordination.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Role assignment (secret) → Action rounds → Discussion + vote → Reveal → Results.

UI
Show:

- Shared objective progress
- Player actions (public)
- Your role (private)
- Discussion timer
- Vote interface
- Round counter
- Voice status

VISUAL STYLE

- Mysterious, slightly dark aesthetic.
- Hidden information clearly separated from public state.
- Dramatic role reveal animations.
- Clean action cards.

ACCESSIBILITY

- Keyboard navigation, large touch targets.
- Screen-reader-friendly role announcements (private audio).
- Text chat alternative.
- High contrast, reduced motion.

TECHNICAL

- Server-authoritative role assignment.
- NEVER reveal Saboteur identity to other clients.
- Validate all actions server-side.
- Separate: Role system, action engine, vote system, objective tracker, multiplayer, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 2: Secret Saboteur)
