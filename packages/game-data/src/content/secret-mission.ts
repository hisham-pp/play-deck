import { defineGameModule } from '../core/base-game';
import { GameCategories } from '../enums/category.enum';
import { GameReleaseDates } from '../enums/release-date.enum';
import { GameTags } from '../enums/tags.enum';
import { getPCount } from '../helpers/players.utils';
export const secretMissionGame = defineGameModule({
  id: 'secret-mission',
  description:
    'Every player carries a secret objective to complete without being caught by the others. Stealth, bluffing, and sharp observation in a voice-driven social deduction game for 3–8 agents.',
  category: GameCategories.CS,
  players: getPCount(3, 8),
  releaseDate: GameReleaseDates.D_2026_09_20,
  tags: [GameTags.M_P, GameTags.V_C, GameTags.P, GameTags.SD],
  seo: {
    title: 'Secret Mission — Stealth Social Deduction Party Game',
    description:
      'Every player carries a secret objective. Complete yours without getting caught! A social deduction party game of stealth, accusation, and bluffing for 3–8 players.',
    keywords: [
      'secret mission',
      'social deduction',
      'stealth party game',
      'secret objective game',
      'accusation game',
      'voice chat party game',
      'multiplayer party game',
      'bluffing game',
    ],
  },
  tagline: 'Complete your secret objective without getting caught by the other agents!',
  overview: [
    'Secret Mission is a voice-driven social deduction party game where every player holds a private objective they must complete without detection. Missions range from social interactions to clever behavioral tricks.',
    'Use voice chat to interact naturally while subtly completing your mission. Other players watch closely for suspicious patterns and can accuse you at any moment. A successful accusation rewards the detective and penalizes the caught agent.',
    'The ultimate spy completes their mission undetected for the maximum point haul. The best detective racks up successful catches. Who will outsmart whom?',
  ],
  howToPlay: [
    {
      title: '1. Receive Your Secret Mission',
      description:
        'At game start, each player receives a private mission card with a unique objective to complete.',
    },
    {
      title: '2. Free Play Phase',
      description:
        'All players interact freely via voice chat. Complete your mission subtly while observing others.',
    },
    {
      title: '3. Make Accusations',
      description:
        'If you suspect someone has completed or is attempting their mission, accuse them immediately!',
    },
    {
      title: '4. Resolve Accusations',
      description:
        'The host resolves each accusation. A correct catch rewards the detective; a wrong accusation penalizes them.',
    },
    {
      title: '5. Score & Reveal',
      description:
        'After all rounds, missions are revealed. Undetected completions earn maximum points!',
    },
  ],
  rules: [
    {
      title: 'Mission Secrecy',
      description:
        'Your mission is strictly private. Never directly reveal your objective to other players.',
    },
    {
      title: 'Accusation Risk',
      description:
        'A correct accusation earns +150 pts for the accuser and costs the caught player -100 pts.',
    },
    {
      title: 'Wrong Accusation Penalty',
      description:
        'Falsely accusing an innocent player costs the accuser -50 points. Choose your targets wisely.',
    },
    {
      title: 'Undetected Completion Bonus',
      description:
        'Complete your mission without being caught for an extra 200 point bonus on top of the base reward.',
    },
  ],
  controls: [
    {
      key: 'Declare Complete Button',
      action: 'Signal that you have completed your secret mission',
    },
    {
      key: 'Accuse Button',
      action: 'Select a suspect and describe what mission you think they completed',
    },
    {
      key: 'Resolve Buttons (Host)',
      action: 'Confirm or deny pending accusations from other players',
    },
    {
      key: 'Microphone',
      action: 'Interact with players and complete social missions via voice chat',
    },
  ],
  tips: [
    "Complete your mission gradually and naturally — don't rush or make it obvious.",
    'Keep an eye on quiet players — silence can be just as suspicious as excessive talking.',
    "Bluff! Even if you've already completed your mission, keep acting like you haven't.",
    'Use voice chat strategically — some missions require specific conversational patterns.',
  ],
  faq: [
    {
      question: 'How many players can play Secret Mission?',
      answer:
        'Secret Mission supports 3 to 8 players. Bot agents can fill empty slots for smaller groups.',
    },
    {
      question: "Can I see other players' missions?",
      answer:
        'Never! Missions are strictly private. They are only revealed at the end of the game during the debrief.',
    },
    {
      question: 'What happens if no one completes their mission?',
      answer:
        'The round ends and points are tallied based on successful accusations only. A new round begins with fresh missions.',
    },
  ],
});

export const secretMissionContent = secretMissionGame.content;
export const secretMissionDefinition = secretMissionGame.definition;
