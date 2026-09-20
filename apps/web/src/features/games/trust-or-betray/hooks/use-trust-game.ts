import { useCallback, useEffect, useRef, useState } from 'react';

import { decideBotChoice, decideBotTrialVote, generateBotChatMessage } from '../engine/trust-bot';
import { MISSION_POOL, resolveExileTrial, resolveRoundOutcomes } from '../engine/trust-engine';
import { trustSoundService } from '../services/trust-sound.service';
import { DEFAULT_CAREER_STATS, trustStatsRepository } from '../services/trust-stats-repository';
import type {
  BotArchetype,
  ChatMessage,
  MissionObjective,
  PlayerChoice,
  RoundPhase,
  RoundResult,
  TrustOrBetrayCareerStats,
  TrustOrBetrayConfig,
  TrustPlayer,
} from '../types/trust-or-betray.types';

const INITIAL_CONFIG: TrustOrBetrayConfig = {
  playerCount: 4,
  roundCount: 5,
  choiceDuration: 12,
  discussionDuration: 12,
  soundEnabled: true,
  highContrast: false,
  reducedMotion: false,
};

export function useTrustGame(initialLocalPlayerId = 'player-local') {
  const [phase, setPhase] = useState<RoundPhase>('lobby');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [activeMission, setActiveMission] = useState<MissionObjective>(MISSION_POOL[0]);
  const [groupPot, setGroupPot] = useState(MISSION_POOL[0].basePot);
  const [cooperationStreak, setCooperationStreak] = useState(0);
  const [players, setPlayers] = useState<TrustPlayer[]>([]);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [currentVotes, setCurrentVotes] = useState<Record<string, string | null>>({});
  const [winnerId, setWinnerId] = useState<string | undefined>();
  const [winnerName, setWinnerName] = useState<string | undefined>();
  const [careerStats, setCareerStats] = useState<TrustOrBetrayCareerStats>(DEFAULT_CAREER_STATS);
  const [config, setConfig] = useState<TrustOrBetrayConfig>(INITIAL_CONFIG);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef({
    phase,
    players,
    currentRound,
    totalRounds,
    activeMission,
    cooperationStreak,
    history,
    currentVotes,
  });

  stateRef.current = {
    phase,
    players,
    currentRound,
    totalRounds,
    activeMission,
    cooperationStreak,
    history,
    currentVotes,
  };

  // Load career stats on mount
  useEffect(() => {
    void trustStatsRepository.getStats().then(setCareerStats);
  }, []);

  const playSoundEffect = useCallback(
    (type: 'lock' | 'heart' | 'coop' | 'betray' | 'sabotage' | 'gavel' | 'flip') => {
      if (!config.soundEnabled) return;
      if (type === 'lock') trustSoundService.playLockIn();
      else if (type === 'heart') trustSoundService.playHeartbeat();
      else if (type === 'coop') trustSoundService.playCooperateChime();
      else if (type === 'betray') trustSoundService.playBetrayalSting();
      else if (type === 'sabotage') trustSoundService.playSabotageAlarm();
      else if (type === 'gavel') trustSoundService.playGavelStrike();
      else if (type === 'flip') trustSoundService.playFlipChord();
    },
    [config.soundEnabled],
  );

  const startSoloMatch = useCallback(
    ({ botCount = 3, roundCount = 5 }: { botCount?: number; roundCount?: number }) => {
      const archetypes: BotArchetype[] = ['saint', 'opportunist', 'grudgebearer', 'wildcard'];
      const botPlayers: TrustPlayer[] = Array.from({ length: botCount }).map((_, idx) => {
        const arch = archetypes[idx % archetypes.length];
        return {
          id: `bot-${idx + 1}`,
          name: `Operative ${arch.toUpperCase()}`,
          avatar: ['🤖', '🕵️', '🥷', '🦾'][idx % 4],
          color: ['#ef4444', '#f59e0b', '#a855f7', '#10b981'][idx % 4],
          isBot: true,
          archetype: arch,
          score: 0,
          currentChoice: null,
          hasLockedIn: false,
          trustRating: 50,
          trustLevel: 'neutral',
          cooperationCount: 0,
          betrayalCount: 0,
          isExiled: false,
          exileRoundsRemaining: 0,
          votesAgainst: 0,
        };
      });

      const human: TrustPlayer = {
        id: initialLocalPlayerId,
        name: 'You (Agent)',
        avatar: '⭐',
        color: '#06b6d4',
        isBot: false,
        score: 0,
        currentChoice: null,
        hasLockedIn: false,
        trustRating: 50,
        trustLevel: 'neutral',
        cooperationCount: 0,
        betrayalCount: 0,
        isExiled: false,
        exileRoundsRemaining: 0,
        votesAgainst: 0,
      };

      const initialPlayers = [human, ...botPlayers];
      const firstMission = MISSION_POOL[0];

      setPlayers(initialPlayers);
      setCurrentRound(1);
      setTotalRounds(roundCount);
      setActiveMission(firstMission);
      setGroupPot(firstMission.basePot);
      setCooperationStreak(0);
      setHistory([]);
      setChat([]);
      setCurrentVotes({});
      setWinnerId(undefined);
      setWinnerName(undefined);

      // Start briefing
      setPhase('briefing');
      setTimeRemaining(3);
    },
    [initialLocalPlayerId],
  );

  const transitionToReveal = useCallback(
    (currentChoices: Record<string, PlayerChoice>) => {
      const {
        currentRound: roundNum,
        activeMission: mission,
        cooperationStreak: streak,
        players: currentPls,
      } = stateRef.current;

      const result = resolveRoundOutcomes({
        roundNumber: roundNum,
        mission,
        players: currentPls,
        choices: currentChoices,
        cooperationStreak: streak,
      });

      setPlayers(result.updatedPlayers);
      setCooperationStreak(result.newStreak);
      setHistory((prev) => [...prev, result.roundResult]);
      setPhase('reveal');
      setTimeRemaining(4);

      playSoundEffect('flip');
      setTimeout(() => {
        if (result.outcome === 'all_cooperate') {
          playSoundEffect('coop');
        } else if (result.outcome === 'solo_betray') {
          playSoundEffect('betray');
        } else {
          playSoundEffect('sabotage');
        }
      }, 500);
    },
    [playSoundEffect],
  );

  const lockInChoice = useCallback(
    (choice: PlayerChoice) => {
      playSoundEffect('lock');

      const currentPls = stateRef.current.players;
      const choices: Record<string, PlayerChoice> = {};

      // Fill bot choices
      currentPls.forEach((p) => {
        if (p.id === initialLocalPlayerId) {
          choices[p.id] = choice;
        } else if (p.isBot && !p.isExiled) {
          choices[p.id] = decideBotChoice({
            bot: p,
            allPlayers: currentPls,
            currentRound: stateRef.current.currentRound,
            mission: stateRef.current.activeMission,
            cooperationStreak: stateRef.current.cooperationStreak,
            history: stateRef.current.history,
          });
        }
      });

      setPlayers((prev) =>
        prev.map((p) => (p.id === initialLocalPlayerId ? { ...p, hasLockedIn: true } : p)),
      );

      transitionToReveal(choices);
    },
    [initialLocalPlayerId, playSoundEffect, transitionToReveal],
  );

  const submitVote = useCallback(
    (accusedId: string | null) => {
      playSoundEffect('lock');
      const currentPls = stateRef.current.players;
      const votes: Record<string, string | null> = {
        [initialLocalPlayerId]: accusedId,
      };

      currentPls.forEach((p) => {
        if (p.isBot && !p.isExiled) {
          votes[p.id] = decideBotTrialVote(p, currentPls, stateRef.current.history);
        }
      });

      setCurrentVotes(votes);
      const trialResult = resolveExileTrial(currentPls, votes);
      setPlayers(trialResult.updatedPlayers);

      playSoundEffect('gavel');
      setPhase('round_summary');
      setTimeRemaining(5);
    },
    [initialLocalPlayerId, playSoundEffect],
  );

  const sendChatMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const localPlayer = players.find((p) => p.id === initialLocalPlayerId);
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: initialLocalPlayerId,
        senderName: localPlayer?.name ?? 'You',
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChat((prev) => [...prev, newMsg]);

      // Random bot reply
      const activeBots = players.filter((p) => p.isBot && !p.isExiled);
      if (activeBots.length > 0 && Math.random() < 0.6) {
        const respondingBot = activeBots[Math.floor(Math.random() * activeBots.length)];
        setTimeout(
          () => {
            const botMsg = generateBotChatMessage(respondingBot);
            setChat((prev) => [...prev, botMsg]);
          },
          800 + Math.random() * 1000,
        );
      }
    },
    [initialLocalPlayerId, players],
  );

  const finishMatch = useCallback(() => {
    const finalPlayers = stateRef.current.players;
    const sorted = [...finalPlayers].sort((a, b) => b.score - a.score);
    const topWinner = sorted[0];

    setWinnerId(topWinner?.id);
    setWinnerName(topWinner?.name);
    setPhase('match_over');

    const humanPlayer = finalPlayers.find((p) => p.id === initialLocalPlayerId);
    const didWin = topWinner?.id === initialLocalPlayerId;
    const humanScore = humanPlayer?.score ?? 0;
    const humanCoops = humanPlayer?.cooperationCount ?? 0;
    const humanBetrayals = humanPlayer?.betrayalCount ?? 0;
    const wasExiled = humanPlayer?.isExiled ?? false;

    void trustStatsRepository
      .recordMatchCompletion({
        won: didWin,
        score: humanScore,
        cooperations: humanCoops,
        betrayals: humanBetrayals,
        soloSabotages: humanBetrayals > 0 && didWin ? 1 : 0,
        wasExiled,
        alliedRounds: humanCoops,
      })
      .then(setCareerStats);
  }, [initialLocalPlayerId]);

  const advanceNextRound = useCallback(() => {
    const nextRound = stateRef.current.currentRound + 1;
    if (nextRound > stateRef.current.totalRounds) {
      finishMatch();
      return;
    }

    const missionIdx = (nextRound - 1) % MISSION_POOL.length;
    const nextMission = MISSION_POOL[missionIdx];

    setCurrentRound(nextRound);
    setActiveMission(nextMission);
    setGroupPot(nextMission.basePot);
    setCurrentVotes({});
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        currentChoice: null,
        hasLockedIn: false,
        votesAgainst: 0,
      })),
    );

    setPhase('briefing');
    setTimeRemaining(3);
  }, [finishMatch]);

  // Phase Timer countdown
  useEffect(() => {
    if (phase === 'lobby' || phase === 'match_over') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);

          // Timer expired transitions
          const currPhase = stateRef.current.phase;
          if (currPhase === 'briefing') {
            setPhase('choosing');
            return 12;
          } else if (currPhase === 'choosing') {
            // Auto lock-in cooperate if time ran out
            lockInChoice('cooperate');
            return 0;
          } else if (currPhase === 'reveal') {
            const isTrialRound = stateRef.current.currentRound % 2 === 0;
            if (isTrialRound) {
              setPhase('trial_vote');
              return 12;
            }
            setPhase('discussion');
            return 10;
          } else if (currPhase === 'discussion') {
            setPhase('round_summary');
            return 5;
          } else if (currPhase === 'trial_vote') {
            submitVote(null); // Abstain
            return 0;
          } else if (currPhase === 'round_summary') {
            advanceNextRound();
            return 0;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advanceNextRound, lockInChoice, phase, submitVote]);

  return {
    phase,
    currentRound,
    totalRounds,
    timeRemaining,
    activeMission,
    groupPot,
    cooperationStreak,
    players,
    history,
    chat,
    currentVotes,
    winnerId,
    winnerName,
    careerStats,
    config,
    setConfig,
    startSoloMatch,
    lockInChoice,
    submitVote,
    sendChatMessage,
    advanceNextRound,
    playSoundEffect,
  };
}
