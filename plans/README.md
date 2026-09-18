# PlayDeck — Game Plans

> **Philosophy**: Mix 2–3 classic games with 5–8 unusual social/physics games.
> Prioritize games where **voice chat creates funny moments** over traditional board/card clones.

---

## 🧠 Strategy + Chaos

---

### 1. Trust or Betray

```text
Create a social strategy game called "Trust or Betray" for Play Deck.

Players: 3-8

CORE CONCEPT
Players cooperate to complete shared tasks, but secretly one player
can sabotage everyone. Each round, players vote to take a cooperative
or selfish action. Cooperation rewards everyone, but betrayal rewards
only the betrayer — at the cost of the group.

GAMEPLAY
- Each round presents a shared objective with a group reward.
- Players simultaneously choose: Cooperate or Betray.
- If everyone cooperates, the group earns maximum points.
- If one player betrays, the betrayer earns bonus points and everyone else loses.
- If multiple players betray, all betrayers earn nothing.
- After choices are revealed, a brief discussion phase begins.
- Players can accuse, defend, or bluff.
- After several rounds, an optional vote to "exile" a suspected betrayer.
- Exiled players lose accumulated points.

SCORING
- Cooperation streaks earn increasing bonuses.
- Successful solo betrayal earns a large payout.
- Failed group betrayal penalizes all betrayers.
- Final scoring rewards consistency and deception equally.

VOICE INTEGRATION
Voice chat is central to the experience.
- Discussion phases rely on voice negotiation and bluffing.
- Accusations, alliances, and broken promises create memorable moments.
- Use Play Deck's existing voice chat system.

GAME FLOW
Lobby → Role assignment → Round (choose + reveal + discuss) → Vote phase → Next round → Final standings.

UI
Show:
- Round number
- Group pool
- Personal score
- Player list with trust indicators
- Choice timer
- Discussion timer
- Vote interface
- Voice status

VISUAL STYLE
- Tense, atmospheric interface.
- Dramatic reveal animations.
- Trust/betrayal visual metaphors.
- Clean player cards.
- Satisfying choice confirmation effects.

ACCESSIBILITY
- Keyboard navigation for all choices.
- Touch-friendly buttons.
- Screen-reader announcements for reveals.
- High contrast, reduced motion.
- Text chat alternative for discussion.

TECHNICAL
Separate:
- Choice engine
- Scoring rules
- Vote system
- Discussion timer
- Multiplayer sync
- Voice adapter
- UI
```

---

### 2. Secret Saboteur

```text
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
```

---

### 3. Auction Panic

```text
Create a fast-paced multiplayer Auction Panic game for Play Deck.

Players: 2-6

CORE CONCEPT
Players bid on mystery items with limited money, then discover
what they actually bought. Some items are treasures, some are junk.

GAMEPLAY
- Each player starts with a fixed budget.
- A mystery item is presented with a vague hint (silhouette, cryptic description, category).
- Players bid in real-time. Bids are visible to everyone.
- Highest bidder wins the item and pays their bid.
- The item is then revealed: it could be high-value treasure or worthless junk.
- After all items are auctioned, total item values determine the winner.
- Some items have combo bonuses (collect a set for extra points).
- Some items have negative effects (reduce your score, force you to bid on the next item).

SPECIAL ROUNDS
- Blind auction: bids are hidden until reveal.
- Forced bid: everyone must bid at least the minimum.
- Double or nothing: winner gets 2x value or loses their bid.
- Steal round: winner can steal an item from another player instead.

VOICE INTEGRATION
Voice chat enables trash talk, bluffing about item values, and alliance-breaking.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Budget allocation → Auction rounds → Item reveals → Final scoring.

UI
Show:
- Current mystery item (hint only)
- Bid interface (slider or buttons)
- Player budgets
- Won items collection
- Current highest bid
- Timer
- Voice status

VISUAL STYLE
- Exciting auction house aesthetic.
- Dramatic item reveal animations.
- Mystery packaging for unrevealed items.
- Satisfying bid confirmation effects.
- Trophy case for won items.

ACCESSIBILITY
- Keyboard bidding controls.
- Large touch targets.
- Screen-reader item descriptions.
- High contrast, reduced motion.

TECHNICAL
Separate:
- Item generator (value, hints, categories)
- Auction engine (bidding rules, timing)
- Scoring (combos, penalties)
- Multiplayer sync
- Voice adapter
- UI
```

---

### 4. Kingdom Draft

```text
Create a competitive drafting strategy game called "Kingdom Draft" for Play Deck.

Players: 2-6

CORE CONCEPT
Players draft resources from a shared pool and build tiny kingdoms
while secretly competing for hidden objectives.

GAMEPLAY
- Each round, a set of resource cards is revealed.
- Players take turns drafting one resource at a time.
- Resources include: land, people, gold, food, defense, culture.
- Players place resources into their kingdom grid.
- Adjacent resources create bonuses (farm next to water = extra food).
- Each player has a secret objective (largest army, most culture, richest, etc.).
- After all rounds, kingdoms are scored.
- Players who completed their secret objective earn a large bonus.

DRAFT MECHANICS
- Snake draft: order reverses each round.
- Some resources are face-down (mystery picks).
- Rare resources appear occasionally.
- Trade phase: players can negotiate trades between rounds.

VOICE INTEGRATION
Trade negotiations, bluffing about objectives, and resource disputes.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Objective assignment → Draft rounds → Build phase → Trade phase → Final scoring.

UI
Show:
- Available resources
- Your kingdom grid
- Your secret objective
- Other players' visible kingdoms
- Draft order
- Round counter
- Voice status

VISUAL STYLE
- Miniature kingdom aesthetic.
- Clean resource icons.
- Satisfying placement animations.
- Kingdom growth visualized.
- Elegant scoring reveal.

ACCESSIBILITY
- Keyboard grid navigation.
- Touch-friendly resource selection.
- Screen-reader resource descriptions.
- High contrast, reduced motion.

TECHNICAL
Separate:
- Draft engine
- Kingdom grid
- Scoring (adjacency, objectives)
- Trade system
- Multiplayer sync
- Voice adapter
- UI
```

---

### 5. Push Your Luck

```text
Create a tension-filled multiplayer Push Your Luck game for Play Deck.

Players: 2-8

CORE CONCEPT
Keep collecting points, but every additional move increases the chance
of losing everything you've accumulated this round.

GAMEPLAY
- On your turn, draw from a deck or spin a wheel.
- Each draw adds points to your "bank" for this round.
- After each draw, choose: BANK (save your points) or PUSH (draw again).
- If you push and hit a bust card/result, you lose ALL points from this round.
- If you bank, your points are safe and the turn passes.
- First player to reach the target score wins.

RISK ESCALATION
- Early draws are almost always safe.
- Each additional draw increases bust probability.
- Multiplier cards occasionally appear: 2x or 3x your current round total.
- Some draws let you steal banked points from other players.
- "Insurance" cards protect against one bust.

VOICE INTEGRATION
The tension of push/bank decisions is amplified by voice reactions.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Target score selection → Turns → Push/Bank decisions → Winner.

UI
Show:
- Current round points (at risk)
- Banked points (safe)
- Risk meter
- Last draw result
- Player scores
- Target score progress
- Voice status

VISUAL STYLE
- High-tension casino-inspired aesthetic.
- Dramatic draw animations.
- Risk meter that visually builds tension.
- Satisfying bank confirmation.
- Devastating bust animation.

ACCESSIBILITY
- Two-button interface (Push / Bank).
- Keyboard controls.
- Screen-reader draw announcements.
- High contrast, reduced motion.

TECHNICAL
Separate:
- Deck/probability engine
- Risk calculator
- Scoring
- Turn management
- Multiplayer sync
- Voice adapter
- UI
```

---

## 😂 Voice-Chat-Friendly Party Games

---

### 6. One Word Story

```text
Create a collaborative party game called "One Word Story" for Play Deck.

Players: 3-8

CORE CONCEPT
Players collaboratively create a story, one word at a time.
Unexpected combinations and deliberate chaos create hilarious results.

GAMEPLAY
- Players sit in a circle order.
- A story prompt or theme is shown.
- Each player adds exactly ONE word to the story on their turn.
- Words appear in real-time as they're added.
- The story builds continuously.
- After a set number of words (or rounds), the story is complete.
- The full story is read back and players vote on the best moments.

MODES
- Classic: one word per turn, fixed order.
- Speed: short timer per word, penalty for slow.
- Theme: story must follow a genre (horror, romance, sci-fi).
- Competitive: players earn points for words that get voted "funniest."
- Challenge: certain words are banned or required.

VOTING
- After the story, highlight individual contributions.
- Players vote for: funniest word, best twist, worst word.
- Points awarded based on votes.

VOICE INTEGRATION
Players often read the story aloud as it builds, adding dramatic flair.
Laughter and reactions are the core experience.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Theme selection → Story building → Story readback → Voting → Scores.

UI
Show:
- Story text (scrolling, growing)
- Current player indicator
- Word input
- Timer per turn
- Theme/prompt
- Player list
- Vote interface
- Voice status

VISUAL STYLE
- Storybook / typewriter aesthetic.
- Words appear with smooth typing animation.
- Player-colored word highlights.
- Fun story completion celebration.
- Clean, readable typography.

ACCESSIBILITY
- Keyboard-first word input.
- Screen-reader story reading.
- Large text, high contrast.
- Reduced motion.

TECHNICAL
Separate:
- Story state
- Turn management
- Word validation (optional profanity filter)
- Voting system
- Scoring
- Multiplayer sync
- Voice adapter
- UI
```

---

### 7. Bad Architect ⭐

```text
Create a hilarious party game called "Bad Architect" for Play Deck.

Players: 3-8

CORE CONCEPT
One player sees a target structure or image. Everyone else must
build/draw it based ONLY on that player's verbal instructions.
At the end, reveal the reference and compare the results.

GAMEPLAY
- One player is the Architect. They see a reference image/structure.
- Other players have a building canvas (grid-based block placement or drawing tool).
- The Architect describes the structure using only voice.
- The Architect CANNOT see what others are building.
- Builders CANNOT see the reference.
- Timer limits the build phase.
- When time ends, all builds are revealed alongside the reference.
- Players vote on the closest match and the funniest attempt.

REFERENCE TYPES
- Simple geometric arrangements.
- Pixel art patterns.
- Abstract shapes.
- Recognizable objects (house, car, animal).
- Increasingly complex references as rounds progress.

SCORING
- Similarity score (algorithmic comparison for grid builds).
- Vote-based: "Closest Match" and "Funniest Disaster" awards.
- Architect earns points based on average similarity.

VOICE INTEGRATION
Voice is THE core mechanic. The Architect must describe using only words.
Miscommunication IS the game.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Architect selection → Reference shown (to Architect only) → Build phase (voice only) → Reveal + compare → Vote → Rotate Architect → Next round.

UI
Architect view:
- Reference image
- Timer
- "Builders cannot see this" reminder

Builder view:
- Building canvas (grid or drawing)
- Tools (block placement, colors, eraser)
- Timer
- "Listen to the Architect" prompt

Reveal view:
- Side-by-side: reference vs all builds
- Vote interface
- Scores

VISUAL STYLE
- Fun workshop/construction aesthetic.
- Clean building grid.
- Dramatic reveal animation (curtain pull).
- Side-by-side comparison layout.
- Playful, colorful blocks.

ACCESSIBILITY
- Keyboard grid navigation.
- Touch block placement.
- Text chat fallback for Architect.
- Screen-reader grid position announcements.
- High contrast, reduced motion.

TECHNICAL
- Server holds reference image; NEVER send to builder clients.
- Separate: Reference system, building canvas, similarity scoring, voting, turn management, multiplayer sync, voice adapter, UI.
```

---

### 8. Guess the Lie

```text
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
```

---

### 9. Wrong Answers Only

```text
Create a creative party game called "Wrong Answers Only" for Play Deck.

Players: 3-8

CORE CONCEPT
A question appears. Players deliberately submit believable-but-wrong answers.
Everyone votes for the funniest or most creative fake answer.

GAMEPLAY
- A question or prompt appears (trivia, hypothetical, absurd).
- Players submit intentionally wrong but creative answers.
- All answers are displayed.
- Players vote for their favorite (can't vote for their own).
- Points for receiving votes.
- Bonus points for the most-voted answer.

QUESTION TYPES
- "What does NASA stand for?"
- "What happens if you press the red button?"
- "Why do cats purr?"
- "What is the capital of the moon?"
- "Explain quantum physics in one sentence."

SCORING
- 1 point per vote received.
- 3 bonus points for most-voted answer.
- "Crowd Favorite" streak bonus.

VOICE INTEGRATION
Reading answers aloud and reacting is half the fun.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Question → Submit answers → Read/reveal → Vote → Score → Next question.

UI
Show:
- Question prompt
- Answer text input
- All submitted answers
- Vote buttons
- Results animation
- Player scores
- Voice status

VISUAL STYLE
- Playful game-show aesthetic.
- Answer cards with player avatars (after voting).
- Confetti for winning answers.
- Clean, fun typography.

ACCESSIBILITY
- Keyboard text input.
- Touch voting.
- Screen-reader answer reading.
- High contrast, reduced motion.

TECHNICAL
Separate:
- Question bank
- Answer collection
- Voting system
- Scoring
- Multiplayer sync
- Voice adapter
- UI
```

---

### 10. Telephone Drawing

```text
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
```

---

## ⚡ Fast Competitive Games

---

### 11. Loot Dash

```text
Create a fast-paced multiplayer Loot Dash game for Play Deck.

Players: 2-6

CORE CONCEPT
Players run around a tiny map collecting randomly spawning loot
while avoiding traps and other players.

GAMEPLAY
- Small top-down arena with obstacles.
- Loot spawns randomly across the map.
- Players move to collect loot (gold, gems, power-ups).
- Traps spawn alongside loot (spikes, slowdown zones, decoys).
- Collecting loot increases your score.
- Players can bump/push each other.
- Some power-ups let you steal from others or set traps.
- Round ends when timer expires or loot target is reached.

POWER-UPS
- Speed boost
- Magnet (auto-collect nearby loot)
- Shield (immune to traps)
- Thief gloves (steal from nearby players)
- Decoy loot (trap other players)

CONTROLS
Desktop: WASD/arrows to move.
Mobile: Virtual joystick.

VOICE INTEGRATION
Trash talk, calling out loot spawns, and reacting to steals.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Arena selection → Countdown → Dash → Results → Rematch.

VISUAL STYLE
- Colorful top-down arcade.
- Satisfying loot collection effects.
- Clear trap indicators.
- Smooth player movement.
- Fun chaos aesthetic.

TECHNICAL
Separate: Player controller, loot spawner, trap system, power-ups, collision, scoring, multiplayer sync, voice adapter, UI.
```

---

### 12. Floor Is Lava

```text
Create a frantic multiplayer Floor Is Lava game for Play Deck.

Players: 2-6

CORE CONCEPT
Safe tiles continuously disappear. Players must find new paths
while pushing/avoiding opponents. Last player standing wins.

GAMEPLAY
- Grid-based arena of tiles.
- Tiles begin disappearing (turning to lava) from the edges inward.
- Pattern is semi-random but fair.
- Players must keep moving to safe tiles.
- Players can push/bump adjacent opponents.
- Pushed into lava = eliminated.
- Standing on a tile too long = it cracks faster.
- Power-ups spawn on remaining tiles.
- Last player on a safe tile wins.

POWER-UPS
- Platform: creates a temporary safe tile.
- Super push: stronger knockback.
- Freeze: briefly freezes nearby tiles from cracking.
- Double jump: reach non-adjacent tiles.

CONTROLS
Desktop: WASD/arrows + Space to push.
Mobile: Virtual controls + push button.

VOICE INTEGRATION
Panic, alliances, and betrayal.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Arena → Countdown → Lava phase → Elimination → Winner → Rematch.

VISUAL STYLE
- Bright tiles with dramatic lava effects.
- Tile cracking animations.
- Clear safe/danger indicators.
- Satisfying push effects.
- Dramatic elimination.

TECHNICAL
Separate: Tile system, lava pattern generator, player controller, push mechanics, power-ups, multiplayer sync, voice adapter, UI.
```

---

### 13. Magnet Mayhem

```text
Create a physics-based multiplayer Magnet Mayhem game for Play Deck.

Players: 2-4

CORE CONCEPT
Players control magnets. Pull yourself toward objects, push opponents
away, and collect targets scattered across the arena.

GAMEPLAY
- 2D arena with metallic objects, walls, and targets.
- Each player controls a magnet character.
- Two actions: ATTRACT (pull toward nearest object) and REPEL (push away).
- Use attract to sling yourself across the arena.
- Use repel to push opponents away from targets.
- Collect target items for points.
- Physics-based movement: momentum, bouncing, chaining pulls.
- Round ends when all targets collected or timer expires.

ARENA ELEMENTS
- Metal blocks (attractable/repellable)
- Floating targets (collectible)
- Walls (solid boundaries)
- Magnetic fields (boost zones)
- Hazards (lose points on contact)

CONTROLS
Desktop: Mouse aim + left/right click (attract/repel).
Mobile: Touch aim + two buttons.

VOICE INTEGRATION
Chaotic physics moments and creative magnet plays.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Arena → Countdown → Magnet chaos → Results → Rematch.

VISUAL STYLE
- Clean physics playground.
- Magnetic field visualizations.
- Smooth momentum-based movement.
- Satisfying attract/repel effects.
- Particle trails.

TECHNICAL
Separate: Physics engine, magnet mechanics, target system, arena, scoring, multiplayer sync, voice adapter, UI.
```

---

### 14. Gravity Shift ⭐

```text
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
```

---

### 15. Tiny Tank Arena

```text
Create a chaotic multiplayer Tiny Tank Arena game for Play Deck.

Players: 2-6

CORE CONCEPT
Small tanks fight in destructible arenas with limited ammunition
and unusual weapons.

GAMEPLAY
- Top-down view of a small destructible arena.
- Each player controls a tiny tank.
- Move, aim, and shoot.
- Limited ammo per weapon — scavenge for more.
- Arena walls and obstacles are destructible.
- Last tank standing wins, or highest score when timer ends.

WEAPONS
- Standard cannon (limited ammo)
- Bouncing shell (reflects off walls)
- Homing missile (slow but tracks)
- Mine layer (place hidden mines)
- Shield generator (temporary barrier)
- Laser beam (continuous, short range)
- Rubber shell (pushes opponents without damage)

ARENA FEATURES
- Destructible walls and cover.
- Ammo pickups.
- Health pickups.
- Weapon crates (random weapon).
- Environmental hazards (lava pits, ice patches).

CONTROLS
Desktop: WASD move, mouse aim + click shoot.
Mobile: Twin-stick virtual controls.

VOICE INTEGRATION
Trash talk and tactical callouts.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Arena → Countdown → Battle → Results → Rematch.

VISUAL STYLE
- Cute but deadly tank designs.
- Satisfying destruction physics.
- Clear projectile visibility.
- Fun explosion effects.
- Miniature warfare aesthetic.

TECHNICAL
Separate: Tank controller, weapon system, projectile physics, arena (destructible), pickup system, scoring, multiplayer sync, voice adapter, UI.
```

---

## 🎭 Social / Deception

---

### 16. Who Am I?

```text
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
```

---

### 17. Secret Mission

```text
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
```

---

### 18. Imposter Builder ⭐

```text
Create a social deduction building game called "Imposter Builder" for Play Deck.

Players: 4-8

CORE CONCEPT
Everyone receives instructions to build the same object, except one
player receives subtly different instructions. After the build,
everyone votes on who the imposter is.

GAMEPLAY
- All players receive building instructions (e.g., "Build a house with a red roof").
- One player (the Imposter) receives slightly different instructions (e.g., "Build a house with a blue roof").
- Players build on their own canvas (grid-based block placement).
- During building, players can chat via voice but CANNOT see each other's builds.
- After building, all builds are revealed simultaneously.
- Players discuss which build looks different.
- Vote on who the Imposter is.
- Imposter wins if they avoid detection.
- Others win if they correctly identify the Imposter.

INSTRUCTION DIFFERENCES
- Color changes (red → blue)
- Shape differences (square → circle)
- Missing elements (no chimney)
- Extra elements (add a fence)
- Size differences (tall → short)
- Difficulty scales: obvious → extremely subtle differences.

VOICE INTEGRATION
Discussion phase is where deception happens.
The Imposter must lie about their instructions convincingly.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Instruction assignment → Build phase → Reveal → Discussion → Vote → Imposter reveal → Scores.

UI
Build phase:
- Building canvas (grid)
- Your instructions (private)
- Building tools
- Timer

Reveal phase:
- All builds displayed simultaneously
- Player labels
- Discussion timer

Vote phase:
- Vote interface
- Voice status

VISUAL STYLE
- Clean workshop aesthetic.
- Colorful building blocks.
- Dramatic simultaneous reveal.
- Side-by-side comparison view.
- Detective/mystery vote theme.

TECHNICAL
- Server assigns instructions; Imposter gets different version.
- NEVER reveal instruction differences to clients.
- Separate: Instruction generator, building canvas, reveal system, voting, scoring, multiplayer sync, voice adapter, UI.
```

---

### 19. Spy Network

```text
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
```

---

### 20. Alibi

```text
Create a deduction party game called "Alibi" for Play Deck.

Players: 4-8

CORE CONCEPT
Everyone receives a slightly different version of an event.
Players discuss what happened and identify whose version contains
deliberate inconsistencies.

GAMEPLAY
- A short story/scenario is generated.
- Each player receives the same story with minor variations.
- One player receives a version with DELIBERATE inconsistencies.
- Players discuss the event via voice.
- Compare details: "What color was the car?" "What time did it happen?"
- Players vote on whose story doesn't match.
- The player with the inconsistent alibi is the suspect.

STORY TYPES
- Crime scene: "Someone stole the cookies. Where were you?"
- Adventure: "We went to the beach. What happened?"
- Historical: "The treaty was signed. Describe the event."

VOICE INTEGRATION
Detailed story comparison requires careful listening and questioning.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Story distribution → Discussion phase → Detail comparison → Vote → Reveal → Scores.

TECHNICAL
- Server generates story variants.
- Each client receives only their version.
- Separate: Story generator, variant system, voting, scoring, multiplayer sync, voice adapter, UI.
```

---

## 🌀 Weird / Experimental

---

### 21. Shared Brain ⭐

```text
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
```

---

### 22. Don't Wake the Giant ⭐

```text
Create a cooperative stealth party game called "Don't Wake the Giant" for Play Deck.

Players: 3-6

CORE CONCEPT
Players cooperate to collect treasure around a sleeping giant.
Every action increases a noise meter. If the noise meter fills,
the giant wakes and everyone loses.

GAMEPLAY
- A 2D map with a sleeping giant in the center.
- Treasure is scattered around the map.
- Players move around collecting treasure.
- Every action generates noise: moving, collecting, bumping into objects.
- A shared noise meter is visible to all players.
- When the noise meter reaches certain thresholds, the giant stirs (warning).
- If the noise meter fills completely, the giant wakes and ALL players lose.
- Players must coordinate to minimize total noise.
- "Quiet zones" temporarily reduce noise generation.
- Certain treasures are worth more but make more noise.

NOISE SOURCES
- Walking: low noise.
- Running: medium noise.
- Collecting treasure: noise varies by value.
- Bumping into objects/walls: high noise.
- Two players colliding: high noise.
- Power-ups can reduce or increase noise.

GIANT BEHAVIOR
- Sleeping: normal play.
- Stirring: noise meter at 50% — giant shifts, some paths change.
- Restless: noise meter at 75% — giant moves limbs, creates hazards.
- Waking: noise meter at 100% — GAME OVER for everyone.

VOICE INTEGRATION
Players need to coordinate movement to avoid noise collisions.
Voice itself doesn't affect the game, but whispered coordination
creates hilarious tension.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Map selection → Countdown → Stealth collection → Escape phase → Results.

UI
Show:
- Map with giant
- Noise meter (shared)
- Collected treasure
- Player positions
- Giant status indicator
- Voice status

VISUAL STYLE
- Dark, atmospheric fairy-tale aesthetic.
- Sleeping giant with breathing animation.
- Glowing treasure.
- Noise ripple effects when actions generate sound.
- Tense stirring animations.
- Dramatic wake-up sequence.

ACCESSIBILITY
- Keyboard + touch movement.
- Clear noise meter visualization.
- Visual giant status indicators.
- High contrast, reduced motion.

TECHNICAL
Separate: Giant AI (sleep phases), noise system, treasure placement, player movement, collision, multiplayer sync, voice adapter, UI.
```

---

### 23. Reverse Racing ⭐

```text
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
```

---

### 24. Gravity Golf

```text
Create a puzzle game called "Gravity Golf" for Play Deck.

Players: 1-4

CORE CONCEPT
Instead of hitting the ball, players manipulate gravity fields
to guide the ball into the hole.

GAMEPLAY
- Ball starts at a fixed position.
- Players place gravity wells (attractors) and gravity shields (repellers).
- Press "Launch" to release the ball.
- The ball moves based on the gravity fields placed.
- Guide the ball into the hole.
- Fewer gravity objects placed = higher score.
- Compete for the fewest placements across multiple holes.

GRAVITY OBJECTS
- Attractor: pulls the ball toward it.
- Repeller: pushes the ball away.
- Directional field: pushes the ball in one direction.
- Orbit ring: ball orbits around it.
- Gravity wall: redirects ball momentum.

VOICE INTEGRATION
Discussing strategies and reacting to creative solutions.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Hole selection → Place gravity objects → Launch → Watch → Score → Next hole.

VISUAL STYLE
- Space/cosmic aesthetic.
- Gravity field visualizations.
- Elegant ball trajectory trails.
- Satisfying hole completion.
- Star-field background.

TECHNICAL
Separate: Physics engine, gravity objects, hole design, scoring, multiplayer sync, voice adapter, UI.
```

---

### 25. Tiny Island

```text
Create a competitive survival game called "Tiny Island" for Play Deck.

Players: 2-6

CORE CONCEPT
The island shrinks every round. Players collect resources, build
bridges, block paths, and steal from each other to survive.

GAMEPLAY
- Players start on a shared island grid.
- Each round, the island loses tiles from the edges (sinks).
- Players collect resources from tiles: wood, stone, food.
- Resources can be used to: build bridges, create barriers, craft tools.
- Players can steal resources from adjacent opponents.
- Falling off the island = eliminated.
- Last player standing wins.

ACTIONS PER TURN
- Move
- Collect resource
- Build (bridge, barrier, shelter)
- Steal (from adjacent player)
- Push (push adjacent player)

ISLAND PHASES
- Full island: plenty of space, resource gathering.
- Shrinking: edges disappear, tension rises.
- Critical: tiny remaining area, direct confrontation.
- Final: single tiles, pure survival.

VOICE INTEGRATION
Alliances, betrayals, and resource negotiations.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Island generation → Rounds (action + shrink) → Elimination → Winner.

VISUAL STYLE
- Tropical island pixel art.
- Dramatic tile sinking animations.
- Clear resource indicators.
- Water rising effects.
- Tense final phase atmosphere.

TECHNICAL
Separate: Island grid, shrink pattern, resource system, building, combat, multiplayer sync, voice adapter, UI.
```

---

### 26. Shadow Tag

```text
Create an atmospheric multiplayer Shadow Tag game for Play Deck.

Players: 3-6

CORE CONCEPT
You can't directly see opponents. You only see their shadows
and environmental clues.

GAMEPLAY
- 2D arena with obstacles and light sources.
- Players are invisible but cast shadows based on light positions.
- Tag other players by touching their shadow.
- Tagged players become "it."
- Light sources move, creating shifting shadows.
- Players can interact with light sources (block, redirect).
- Environmental clues: footstep particles, disturbed objects.

VOICE INTEGRATION
Tracking opponents through audio cues and shadow observations.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Arena → Tag phase → Score → Rematch.

VISUAL STYLE
- Dark atmospheric arena.
- Dramatic shadow casting.
- Dynamic lighting.
- Subtle environmental interaction effects.
- Mysterious aesthetic.

TECHNICAL
Separate: Shadow/lighting engine, player controller, tag system, light source management, multiplayer sync, voice adapter, UI.
```

---

### 27. Bomb Factory

```text
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
```

---

### 28. Color Thief

```text
Create a territory control game called "Color Thief" for Play Deck.

Players: 2-6

CORE CONCEPT
Players steal territory from each other by painting tiles, but
certain colors have hidden abilities.

GAMEPLAY
- Grid-based arena with neutral tiles.
- Each player has a color.
- Move onto neutral or opponent tiles to claim them.
- Tiles adjacent to your territory are easier to claim.
- Isolated tile captures are harder.
- Most territory at the end wins.

COLOR ABILITIES (hidden until first use)
- Red: claims adjacent tiles automatically.
- Blue: freezes opponent tiles temporarily.
- Green: grows territory slowly over time.
- Yellow: swaps two tiles instantly.
- Purple: blocks opponent movement for 1 turn.

VOICE INTEGRATION
Territory negotiations and ability reveals.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Arena → Turns → Territory scoring → Winner.

VISUAL STYLE
- Paint/ink aesthetic.
- Smooth territory spread animations.
- Ability activation effects.
- Clean grid readability.

TECHNICAL
Separate: Grid system, territory engine, color abilities, turn management, scoring, multiplayer sync, voice adapter, UI.
```

---

### 29. Unstable Elevator

```text
Create a physics party game called "Unstable Elevator" for Play Deck.

Players: 2-4

CORE CONCEPT
Players stand on a physics-based elevator platform and must balance
objects on it while it moves between floors. Drop an object = penalty.

GAMEPLAY
- Shared physics platform (elevator) moving upward.
- Each floor, a new object is placed on the elevator.
- Objects have different shapes, sizes, and weights.
- Players take turns placing objects.
- The elevator shakes, tilts, and accelerates.
- If objects fall off, the player who placed them loses points.
- Survive as many floors as possible.

ELEVATOR BEHAVIORS
- Gentle sway (early floors).
- Sudden stops.
- Tilting.
- Speed changes.
- Wind gusts (later floors).
- Bouncy floor.

VOICE INTEGRATION
Warning teammates, celebrating precarious placements.
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Countdown → Floor by floor placement → Collapse → Scores.

VISUAL STYLE
- Cartoon elevator shaft.
- Satisfying physics stacking.
- Tense wobble animations.
- Dramatic collapse moments.
- Fun object variety.

TECHNICAL
Separate: Physics engine, elevator behavior, object system, placement validation, scoring, multiplayer sync, voice adapter, UI.
```

---

### 30. Human Conveyor Belt

```text
Create a cooperative physics game called "Human Conveyor Belt" for Play Deck.

Players: 2-6

CORE CONCEPT
Players must position themselves to move objects through a
constantly changing machine. Players ARE the machine parts.

GAMEPLAY
- Objects spawn on one side of the screen.
- Objects must reach a target on the other side.
- Players position themselves as "conveyor segments."
- Objects roll/slide across player positions.
- Players must move and reposition as the machine layout changes.
- Objects have different weights and behaviors (bouncy, fragile, heavy).
- Deliver objects successfully for points.
- Drop or break objects = penalty.

PLAYER ROLES
- Each player controls a platform/segment.
- Platforms can tilt, raise, lower.
- Coordination determines whether objects reach the target.
- New routes required as the machine configuration shifts.

VOICE INTEGRATION
Coordination is essential — "Tilt left! I'm catching it! Lower your platform!"
Use Play Deck's existing voice chat.

GAME FLOW
Lobby → Machine configuration → Objects start → Deliver → New configuration → Results.

VISUAL STYLE
- Rube Goldberg machine aesthetic.
- Fun object variety (balls, boxes, oddly shaped items).
- Satisfying delivery effects.
- Clean player-platform visuals.

TECHNICAL
Separate: Physics engine, player platforms, object system, machine configuration, delivery validation, scoring, multiplayer sync, voice adapter, UI.
```

---

## ⭐ Highlighted Priorities

The following games are particularly well-suited for Play Deck's voice-first multiplayer identity:

| Priority | Game                     | Why                                                |
| -------- | ------------------------ | -------------------------------------------------- |
| ⭐⭐⭐   | **Shared Brain**         | Voice IS the mechanic — two players, one character |
| ⭐⭐⭐   | **Bad Architect**        | Voice-only instructions create hilarious builds    |
| ⭐⭐⭐   | **Imposter Builder**     | Social deduction + building = unique combo         |
| ⭐⭐     | **Don't Wake the Giant** | Cooperative tension, whispered coordination        |
| ⭐⭐     | **Reverse Racing**       | Unprecedented dual-role chaos                      |
| ⭐⭐     | **Gravity Shift**        | Simple concept, chaotic multiplayer execution      |
| ⭐       | **Telephone Drawing**    | Proven party format, always funny                  |
| ⭐       | **Bomb Factory**         | Forced cooperation via information asymmetry       |
| ⭐       | **Trust or Betray**      | Classic social dynamics, easy to learn             |
| ⭐       | **Floor Is Lava**        | Instant fun, simple mechanics                      |
