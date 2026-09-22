import type { AlibiPlayer, AlibiState, StoryVariant } from '../types/alibi.types';

export const SCENARIOS = [
  {
    base: 'Someone stole the golden trophy from the museum last night.',
    inconsistencies: [
      'The time was actually 9 PM, not 7 PM',
      'The thief wore a green jacket, not blue',
      'The trophy was on the second floor, not the ground floor',
    ],
  },
  {
    base: "A mysterious note was left on the mayor's desk on Tuesday afternoon.",
    inconsistencies: [
      'The note was left on Wednesday, not Tuesday',
      'It was morning, not afternoon',
      'The note was pink, not white',
    ],
  },
  {
    base: 'A rare painting went missing from the gallery during the Friday evening event.',
    inconsistencies: [
      'The event was on Saturday, not Friday',
      'The painting was in Room 3, not Room 5',
      'It disappeared at closing time, not the evening',
    ],
  },
  {
    base: 'A coded message was intercepted at the docks near the warehouse on Sunday morning.',
    inconsistencies: [
      'The message was intercepted at the airport, not the docks',
      'It was Saturday evening, not Sunday morning',
      'The warehouse was on the east side, not the north side',
    ],
  },
  {
    base: 'An expensive diamond necklace was swapped for a fake at the jewelry store on Thursday.',
    inconsistencies: [
      'The item swapped was a bracelet, not a necklace',
      'It happened on Friday, not Thursday',
      'The fake was left in the front display, not the back',
    ],
  },
];

export function getRandomScenario() {
  return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]!;
}

function generateVariant(
  baseStory: string,
  inconsistencies: string[],
  isSuspect: boolean,
): StoryVariant {
  if (!isSuspect) {
    return {
      baseStory,
      playerStory: baseStory,
      inconsistencies: [],
    };
  }

  const chosen = inconsistencies.slice(0, Math.min(2, inconsistencies.length));
  return {
    baseStory,
    playerStory: `${baseStory} [Your version has subtle differences — remember them!]`,
    inconsistencies: chosen,
  };
}

export function createInitialState(
  players: Array<{
    id: string;
    displayName: string;
    avatar: string;
    isHost: boolean;
    isBot: boolean;
  }>,
  maxRounds = 3,
): AlibiState {
  const suspectIdx = Math.floor(Math.random() * players.length);
  const scenario = getRandomScenario();

  const gamePlayers: AlibiPlayer[] = players.map((p, idx) => ({
    id: p.id,
    displayName: p.displayName,
    avatar: p.avatar,
    isHost: p.isHost,
    isBot: p.isBot,
    isSuspect: idx === suspectIdx,
    storyVariant: generateVariant(scenario.base, scenario.inconsistencies, idx === suspectIdx),
    votedForId: null,
    score: 0,
  }));

  return {
    phase: 'reading',
    players: gamePlayers,
    baseScenario: scenario.base,
    readingTimeRemaining: 60,
    discussionTimeRemaining: 90,
    roundNumber: 1,
    maxRounds,
  };
}

export function startDiscussion(state: AlibiState): AlibiState {
  if (state.phase !== 'reading') return state;
  return { ...state, phase: 'discussion' };
}

export function startVoting(state: AlibiState): AlibiState {
  if (state.phase !== 'discussion') return state;
  return { ...state, phase: 'voting' };
}

export function castVote(state: AlibiState, voterId: string, suspectId: string): AlibiState {
  if (state.phase !== 'voting') return state;

  const updatedPlayers = state.players.map((p) =>
    p.id === voterId ? { ...p, votedForId: suspectId } : p,
  );

  const allVoted = updatedPlayers.every((p) => p.votedForId !== null);

  return {
    ...state,
    players: updatedPlayers,
    phase: allVoted ? 'reveal' : 'voting',
  };
}

export function tallyFinalScores(state: AlibiState): AlibiState {
  const suspect = state.players.find((p) => p.isSuspect);
  if (!suspect) return { ...state, phase: 'game-over' };

  const votesForSuspect = state.players.filter((p) => p.votedForId === suspect.id).length;
  const majority = votesForSuspect > state.players.length / 2;

  const updatedPlayers = state.players.map((p) => {
    if (p.isSuspect) {
      return { ...p, score: majority ? p.score : p.score + 300 };
    }
    if (p.votedForId === suspect.id) {
      return { ...p, score: p.score + 150 };
    }
    return p;
  });

  return { ...state, phase: 'game-over', players: updatedPlayers };
}
