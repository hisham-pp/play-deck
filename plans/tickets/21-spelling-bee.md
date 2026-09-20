## Spelling Bee

Competitive multiplayer Spelling Bee. Players find as many valid words as possible using seven letters in a honeycomb arrangement. One center letter must appear in every word. Pangrams (all 7 letters) earn massive bonuses.

**Players:** 1–6  
**Modes:** Solo · Race · Relay · Daily Challenge  
**Branch:** `feat/spelling-bee`

---

### Core Concept

Seven letters in honeycomb layout, center letter mandatory. Players compete or play solo to discover words of 4+ letters from the dictionary.

---

### Key Requirements

- Seven letters in honeycomb layout, center letter mandatory
- Words must be 4+ letters, letters can be reused
- Dictionary validation for submitted words
- Scoring: 4-letter=1pt, 5=5pt, 6=6pt, 7+=length pts, pangram bonus +7
- Unique word bonus (no other player found it) in multiplayer modes
- Balanced letter set generation (ensure pangram exists, reasonable word count)
- Modes: solo (target score), race (most points), relay (team alternating), daily challenge (persistent leaderboard)
- All players receive same letter set in multiplayer
- Track unique vs shared word discoveries
- Voice chat via PlayDeck WebRTC system
- Lobby → Mode selection → Countdown → Word finding → Results → Next round
- Keyboard input + click/tap letters to build words
- Accessible: Screen-reader letter announcements, high contrast honeycomb, large letters, reduced motion

---

### Technical Modules

- Letter set generator (balanced, pangram-guaranteed)
- Dictionary validator (using pre-generated dictionary)
- Pangram checker
- Scoring engine (length-based, unique bonus)
- Game state manager
- Multiplayer sync & store
- Voice adapter (`RoomVoiceDock`)
- UI (honeycomb, input, found words, progress, timer)
