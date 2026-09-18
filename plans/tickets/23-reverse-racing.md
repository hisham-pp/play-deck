## Reverse Racing

Create a chaotic multiplayer Reverse Racing game for Play Deck.

Players: 2-6

CORE CONCEPT
You don't control your own vehicle. You control obstacles that
try to stop ANOTHER player's vehicle. Each player simultaneously
races AND sabotages, creating a chain of chaos.

GAMEPLAY

- Each player has an auto-driving vehicle on their own track.
- Each player controls the OBSTACLES on another player's track.
- Player A's car races while Player B places obstacles.
- Player B's car races while Player C places obstacles.
- Vehicles auto-drive forward but players can make them jump/dodge.
- The obstacle controller places barriers, traps, and hazards in real-time.
- First vehicle to reach the end wins (their driver gets points).
- Most effective saboteur also earns bonus points.

OBSTACLE TYPES

- Roadblock (stationary barrier)
- Oil slick (causes sliding)
- Speed bump (slows down)
- Moving wall (oscillating barrier)
- Fake road (leads to dead end)
- Boost pad (accidentally helps the racer — risk/reward for saboteur)

DUAL CONTROLS
Desktop:

- Your vehicle: Space to jump, WASD to dodge.
- Opponent's track: Mouse to place obstacles.

Mobile:

- Split-screen touch controls.

VOICE INTEGRATION
Reacting to obstacles, celebrating sabotage, cursing betrayals.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Track assignment → Countdown → Simultaneous race + sabotage → Results → Rematch.

UI
Show:

- Your vehicle view (auto-driving)
- Opponent's track (where you place obstacles)
- Split or tabbed view
- Progress bars for all vehicles
- Sabotage score
- Voice status

VISUAL STYLE

- Colorful cartoon racing.
- Fun obstacle animations.
- Split-screen or picture-in-picture layout.
- Dramatic crash effects.
- Celebration for both racers and saboteurs.

ACCESSIBILITY

- Keyboard controls for both roles.
- Touch-friendly obstacle placement.
- Clear obstacle indicators.
- High contrast, reduced motion.

TECHNICAL

- Server validates obstacle placement (prevent impossible tracks).
- Server tracks vehicle physics.
- Separate: Vehicle auto-driver, obstacle system, track generator, dual-control manager, scoring, multiplayer sync, voice adapter, UI.

---

### Ref

`plans/README.md` (Section 23: Reverse Racing)
