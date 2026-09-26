import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameControlKeys } from '../enums/controls.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const secretSaboteurGame = defineGameModule({
  id: 'secret-saboteur',
  description:
    'Build the Reactor Core or trigger catastrophic meltdown. Hidden-role deduction for 4–8 players with anonymous card contributions and real-time voice accusation trials.',
  category: GameCategories.S,
  players: getPCount(4, 8),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.ST, GameTags.M_P, GameTags.V_C, GameTags.SD, GameTags.CO, GameTags.S],
  seo: {
    title: 'Secret Saboteur — Hidden Role Reactor Deduction | PlayDeck',
    description:
      'Build a Reactor Core or trigger meltdown as the hidden Saboteur. Anonymous card play, accusation trials, and WebRTC voice chat in 4–8 player rooms on PlayDeck.',
    keywords: [
      'secret saboteur',
      'hidden role game',
      'social deduction game',
      'cooperative deception game',
      'reactor game multiplayer',
      'werewolf style game online',
      'webrtc voice deduction game',
    ],
  },
  tagline:
    'Build the Reactor Core together — but one operative is secretly trying to trigger catastrophic meltdown.',
  overview: [
    'Secret Saboteur is a 4 to 8 player hidden-role cooperative deduction game where a loyal crew races to push Reactor Core progress to 100% while a covert Saboteur tries to engineer 3 critical meltdowns.',
    'Each round, operatives receive a secret hand of contribution cards ranging from high-power repairs to devastating sabotage relays. Every player submits a card anonymously — contributions are shuffled and revealed without attribution, making the Saboteur hard to trace.',
    'After each reveal, the crew enters a real-time discussion phase with WebRTC voice chat to debate, accuse, and argue before a majority trial vote can detain suspected infiltrators.',
    "Workers and the optional Inspector role must identify and detain the Saboteur before three meltdown strikes seal the reactor's fate. If the Saboteur survives undetected and triggers three strikes, the mission collapses.",
    'Solo play pits you against four autonomous bot archetypes: the Loyal Specialist, the Methodical Auditor, the Erratic Tinkerer, and the Cunning Infiltrator — each with distinct behavioral patterns to challenge your deduction skills.',
  ],
  howToPlay: [
    {
      title: 'Receive Your Secret Role',
      description:
        'At match start, your private role envelope is revealed: Worker, Saboteur, or Inspector (in 5+ player games). Only you see your role — keep it hidden.',
    },
    {
      title: 'Review the Sector Briefing',
      description:
        'Each round introduces a new reactor subsystem to repair. Learn the required components and understand the stakes before the contribution window opens.',
    },
    {
      title: 'Choose and Submit Your Card',
      description:
        'Select a card from your hand — positive repairs increase reactor progress, while sabotage cards reduce it. All submissions are anonymous and shuffled before reveal.',
    },
    {
      title: 'Analyze the Anonymous Reveal',
      description:
        'Watch contribution cards flip one by one. The net power delta shifts reactor progress. Meltdown strikes are added when the net delta is negative — evidence that a saboteur is active.',
    },
    {
      title: 'Discuss and Accuse',
      description:
        'During the discussion phase, use voice chat or text to argue, accuse, and defend. Accusation pills let you flag specific operatives for trial consideration.',
    },
    {
      title: 'Vote in the Trial',
      description:
        'Every third round triggers a detainment trial. Cast your vote for a suspected saboteur — a majority is required for detention. A tie means no arrest.',
    },
  ],
  rules: [
    {
      title: 'Reactor Progress',
      description:
        'Each round, all submitted contribution card deltas are summed. The result shifts the Reactor Core progress (0–100%). Reaching 100% is a Worker victory.',
    },
    {
      title: 'Meltdown Strikes',
      description:
        'When the net power delta for a round is negative, a Meltdown Strike is added. Three strikes trigger catastrophic meltdown — a Saboteur victory.',
    },
    {
      title: 'Anonymous Contributions',
      description:
        'Card selections are never directly attributed to players during the round. Only the shuffled cards and their combined net delta are revealed — protecting both Worker caution and Saboteur cover.',
    },
    {
      title: 'Trial Detainment',
      description:
        'A detained operative cannot contribute cards the following round. If the true Saboteur is detained, the crew gains a decisive advantage.',
    },
    {
      title: 'Inspector Role',
      description:
        'In 5+ player games, the optional Inspector is secretly aware of statistical suspicion scores and uses them to guide accusation strategy without revealing their own role.',
    },
  ],
  controls: [
    {
      key: GameControlKeys.CLICK_TAP,
      action: 'Select a contribution card or accusation target',
    },
    {
      key: GameControlKeys.ENTER,
      action: 'Confirm card lock-in or send chat message',
    },
    {
      key: GameControlKeys.MOUSE_TOUCH,
      action: 'Interact with accusation pills and trial ballot',
    },
  ],
  tips: [
    'Watch for patterns: a player who consistently contributes low-power cards may be playing it safe as the Saboteur.',
    'Pay attention to who deflects accusations immediately — Saboteurs often try to redirect blame quickly.',
    'In the early rounds, the Saboteur will likely blend in with small positive cards to avoid suspicion.',
    "Trust your suspicion scores: they update automatically based on each round's net contribution.",
    'As Inspector, gather evidence before accusing — a wrong detention wastes a valuable trial vote.',
  ],
  faq: [
    {
      question: 'How many players can play Secret Saboteur?',
      answer:
        'Secret Saboteur supports 4 to 8 players. Solo mode fills out the room with AI bot archetypes. Online mode supports real-time 4 to 8 player rooms via Supabase realtime channels.',
    },
    {
      question: 'Can the crew win even if the Saboteur is never detained?',
      answer:
        'Yes! If the crew pushes Reactor Core progress to 100% before three meltdowns occur, they win regardless of whether the Saboteur was identified.',
    },
    {
      question: 'What happens when the Saboteur is detained?',
      answer:
        'A detained Saboteur cannot contribute cards for one round. Their role is not automatically revealed — the crew must still complete the reactor to claim victory.',
    },
    {
      question: 'Does Secret Saboteur include voice chat?',
      answer:
        "Yes. Online rooms activate peer-to-peer WebRTC voice chat via PlayDeck's built-in voice dock for real-time discussion and accusation debates.",
    },
    {
      question: 'What is the Inspector role?',
      answer:
        'The Inspector is a special Worker variant available in 5+ player games. They behave like Workers but have heightened awareness of suspicion statistics to aid the crew.',
    },
  ],
});

export const secretSaboteurContent = secretSaboteurGame.content;
export const secretSaboteurDefinition = secretSaboteurGame.definition;
