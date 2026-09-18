## Gravity Shift

Create a competitive multiplayer Gravity Shift game for Play Deck.

Players: 2-6

CORE CONCEPT
Everyone navigates the same obstacle course, but players can change
the direction of gravity — affecting everyone simultaneously.

GAMEPLAY

- 2D obstacle course with platforms, hazards, and checkpoints.
- Players race to reach the finish.
- Each player has a limited number of "Gravity Shift" charges.
- Using a charge rotates gravity 90° (up/down/left/right) for ALL players.
- Players must adapt instantly to the new gravity direction.
- Strategic timing: shift gravity when you're in a good position but opponents aren't.
- Reach the finish first to win.

GRAVITY MECHANICS

- Gravity can be: down (normal), up, left, or right.
- Shifts affect ALL players simultaneously.
- Short cooldown between shifts.
- Limited charges per player (recharge at checkpoints).
- Visual indicator shows current gravity direction.

CONTROLS
Desktop: WASD/arrows to move, Space to jump, G to shift gravity.
Mobile: Virtual movement + jump + gravity button.

VOICE INTEGRATION
Screaming when gravity shifts at the worst moment is the experience.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Course selection → Countdown → Race with gravity shifts → Results → Next course.

UI
Show:

- Gravity direction indicator
- Remaining shift charges
- Player positions on course
- Checkpoint progress
- Voice status

VISUAL STYLE

- Disorienting but readable platformer.
- Smooth gravity rotation animation.
- Clear directional indicators.
- Player trails showing momentum.
- Satisfying checkpoint effects.

ACCESSIBILITY

- Clear gravity direction indicator (arrow + color + text).
- Reduced motion option (instant shift vs animated).
- High contrast.

TECHNICAL
Separate: Character physics, gravity system, course design, checkpoint system, shift management, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 14: Gravity Shift)
