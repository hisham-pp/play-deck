import { useCallback, useEffect, useRef, useState } from 'react';

import type { SaboteurBotArchetype } from '../engine/saboteur-bot';
import {
  decideBotCard,
  decideBotTrialVote,
  generateBotChatMessage,
  updateSuspicionScores,
} from '../engine/saboteur-bot';
import {
  SECTOR_MISSIONS,
  assignRoles,
  checkWinCondition,
  generateHand,
  resolveRound,
  resolveTrialVote,
} from '../engine/saboteur-engine';
import { saboteurSoundService } from '../services/saboteur-sound.service';
import {
  DEFAULT_SABOTEUR_STATS,
  saboteurStatsRepository,
} from '../services/saboteur-stats-repository';
import type {
  ChatMessage,
  ContributionCard,
  RoundPhase,
  RoundSummary,
  SaboteurCareerStats,
  SaboteurConfig,
  SaboteurPlayer,
} from '../types/secret-saboteur.types';

const INITIAL_CONFIG: SaboteurConfig = {
  playerCount: 5,
  roundCount: 6,
  includeInspector: true,
  soundEnabled: true,
};

const BOT_ARCHETYPES: SaboteurBotArchetype[] = [
  'loyal-specialist',
  'methodical-auditor',
  'erratic-tinkerer',
  'cunning-infiltrator',
];

const BOT_AVATARS = ['🤖', '🕵️', '🥷', '🦾', '👾', '🧬', '🎭', '⚙️'];
const BOT_COLORS = [
  '#ef4444',
  '#f59e0b',
  '#a855f7',
  '#10b981',
  '#ec4899',
  '#3b82f6',
  '#84cc16',
  '#f97316',
];

export function useSaboteurGame(initialLocalPlayerId = 'player-local') {
  const [phase, setPhase] = useState<RoundPhase>('lobby');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(6);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [reactorProgress, setReactorProgress] = useState(0);
  const [meltdownStrikes, setMeltdownStrikes] = useState(0);
  const [activeSector, setActiveSector] = useState(SECTOR_MISSIONS[0]);
  const [players, setPlayers] = useState<SaboteurPlayer[]>([]);
  const [history, setHistory] = useState<RoundSummary[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [currentVotes, setCurrentVotes] = useState<Record<string, string | null>>({});
  const [winner, setWinner] = useState<'crew' | 'saboteur' | null>(null);
  const [winReason, setWinReason] = useState('');
  const [careerStats, setCareerStats] = useState<SaboteurCareerStats>(DEFAULT_SABOTEUR_STATS);
  const [config, setConfig] = useState<SaboteurConfig>(INITIAL_CONFIG);
  const [localPlayerRole, setLocalPlayerRole] = useState<SaboteurPlayer['role']>('worker');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef({
    phase,
    players,
    currentRound,
    totalRounds,
    activeSector,
    reactorProgress,
    meltdownStrikes,
    history,
    currentVotes,
  });

  stateRef.current = {
    phase,
    players,
    currentRound,
    totalRounds,
    activeSector,
    reactorProgress,
    meltdownStrikes,
    history,
    currentVotes,
  };

  useEffect(() => {
    void saboteurStatsRepository.getStats().then(setCareerStats);
  }, []);

  const playSound = useCallback(
    (type: 'role' | 'lock' | 'shuffle' | 'meltdown' | 'repair' | 'gavel' | 'sabotage') => {
      if (!config.soundEnabled) return;
      if (type === 'role') saboteurSoundService.playRoleReveal();
      else if (type === 'lock') saboteurSoundService.playCardLockIn();
      else if (type === 'shuffle') saboteurSoundService.playContributionShuffle();
      else if (type === 'meltdown') saboteurSoundService.playMeltdownAlarm();
      else if (type === 'repair') saboteurSoundService.playRepairSuccess();
      else if (type === 'gavel') saboteurSoundService.playGavelStrike();
      else if (type === 'sabotage') saboteurSoundService.playSabotageSting();
    },
    [config.soundEnabled],
  );

  const startSoloMatch = useCallback(
    ({ botCount = 4, roundCount: rc = 6 }: { botCount?: number; roundCount?: number }) => {
      const botPlayers: SaboteurPlayer[] = Array.from({ length: botCount }).map((_, idx) => {
        const arch = BOT_ARCHETYPES[idx % BOT_ARCHETYPES.length];
        return {
          id: `bot-${idx + 1}`,
          name: `Operative ${arch.replace('-', ' ').toUpperCase()}`,
          avatar: BOT_AVATARS[idx % BOT_AVATARS.length],
          color: BOT_COLORS[idx % BOT_COLORS.length],
          isBot: true,
          archetype: arch,
          role: 'worker' as const,
          hand: [],
          selectedCard: null,
          hasLockedIn: false,
          isDetained: false,
          suspicionScore: 0,
          votesAgainst: 0,
        };
      });

      const human: SaboteurPlayer = {
        id: initialLocalPlayerId,
        name: 'You (Operative)',
        avatar: '⭐',
        color: '#06b6d4',
        isBot: false,
        role: 'worker',
        hand: [],
        selectedCard: null,
        hasLockedIn: false,
        isDetained: false,
        suspicionScore: 0,
        votesAgainst: 0,
      };

      const allPlayers = [human, ...botPlayers];
      const allIds = allPlayers.map((p) => p.id);
      const { saboteurId, inspectorId } = assignRoles(allIds, config.includeInspector);

      const assignedPlayers: SaboteurPlayer[] = allPlayers.map((p) => {
        let role: SaboteurPlayer['role'] = 'worker';
        if (p.id === saboteurId) role = 'saboteur';
        else if (p.id === inspectorId) role = 'inspector';
        return { ...p, role, hand: generateHand(role === 'saboteur') };
      });

      const humanPlayer = assignedPlayers.find((p) => p.id === initialLocalPlayerId);
      setLocalPlayerRole(humanPlayer?.role ?? 'worker');

      setPlayers(assignedPlayers);
      setCurrentRound(1);
      setTotalRounds(rc);
      setActiveSector(SECTOR_MISSIONS[0]);
      setReactorProgress(0);
      setMeltdownStrikes(0);
      setHistory([]);
      setChat([]);
      setCurrentVotes({});
      setWinner(null);
      setWinReason('');

      setPhase('role_reveal');
      setTimeRemaining(4);
      playSound('role');
    },
    [initialLocalPlayerId, config.includeInspector, playSound],
  );

  const transitionToReveal = useCallback(
    (contributions: { playerId: string; card: ContributionCard }[]) => {
      const {
        currentRound: roundNum,
        activeSector: sector,
        reactorProgress: progress,
        meltdownStrikes: strikes,
        players: currentPls,
      } = stateRef.current;

      playSound('shuffle');

      const result = resolveRound({
        roundNumber: roundNum,
        sector,
        players: currentPls,
        contributions,
        reactorProgress: progress,
        meltdownStrikes: strikes,
      });

      const contribDeltaMap = contributions.map(({ playerId, card }) => ({
        playerId,
        delta: card.powerDelta,
      }));
      const updatedPlayers = updateSuspicionScores(currentPls, contribDeltaMap);

      setPlayers(updatedPlayers);
      setReactorProgress(result.newProgress);
      setMeltdownStrikes(result.newStrikes);
      setHistory((prev) => [...prev, result.roundSummary]);
      setPhase('reveal');
      setTimeRemaining(5);

      if (result.meltdownAdded) playSound('meltdown');
      else playSound('repair');

      // Check win early (meltdown threshold)
      const winCheck = checkWinCondition({
        phase: 'reveal',
        currentRound: roundNum,
        totalRounds: stateRef.current.totalRounds,
        reactorProgress: result.newProgress,
        meltdownStrikes: result.newStrikes,
        activeSector: sector,
        players: updatedPlayers,
        history: [...stateRef.current.history, result.roundSummary],
        chat: [],
        winner: null,
        winReason: '',
      });
      if (winCheck.winner) {
        setWinner(winCheck.winner);
        setWinReason(winCheck.reason);
      }
    },
    [playSound],
  );

  const lockInCard = useCallback(
    (card: ContributionCard) => {
      playSound('lock');

      const currentPls = stateRef.current.players;
      const contributions: { playerId: string; card: ContributionCard }[] = [];

      currentPls.forEach((p) => {
        if (p.isDetained) return;
        if (p.id === initialLocalPlayerId) {
          contributions.push({ playerId: p.id, card });
        } else if (p.isBot) {
          const botCard = decideBotCard({
            bot: p,
            round: stateRef.current.currentRound,
            totalRounds: stateRef.current.totalRounds,
            reactorProgress: stateRef.current.reactorProgress,
            meltdownStrikes: stateRef.current.meltdownStrikes,
            history: stateRef.current.history,
          });
          contributions.push({ playerId: p.id, card: botCard });
        }
      });

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === initialLocalPlayerId ? { ...p, selectedCard: card, hasLockedIn: true } : p,
        ),
      );

      transitionToReveal(contributions);
    },
    [initialLocalPlayerId, playSound, transitionToReveal],
  );

  const submitVote = useCallback(
    (accusedId: string | null) => {
      playSound('lock');
      const currentPls = stateRef.current.players;
      const votes: Record<string, string | null> = {
        [initialLocalPlayerId]: accusedId,
      };

      currentPls.forEach((p) => {
        if (p.isBot && !p.isDetained) {
          votes[p.id] = decideBotTrialVote(p, currentPls, stateRef.current.history);
        }
      });

      setCurrentVotes(votes);
      const trialResult = resolveTrialVote(currentPls, votes);
      setPlayers(trialResult.updatedPlayers);
      playSound('gavel');

      // Update last round summary with detention info
      setHistory((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, detainedPlayerId: trialResult.detainedPlayerId }];
      });

      setPhase('round_summary');
      setTimeRemaining(5);
    },
    [initialLocalPlayerId, playSound],
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

      const activeBots = players.filter((p) => p.isBot && !p.isDetained);
      if (activeBots.length > 0 && Math.random() < 0.6) {
        const bot = activeBots[Math.floor(Math.random() * activeBots.length)];
        setTimeout(
          () => {
            const botMsg = generateBotChatMessage(bot);
            setChat((prev) => [...prev, botMsg]);
          },
          800 + Math.random() * 1000,
        );
      }
    },
    [initialLocalPlayerId, players],
  );

  const finishMatch = useCallback(
    (forcedWinner?: 'crew' | 'saboteur') => {
      const finalPlayers = stateRef.current.players;
      const humanPlayer = finalPlayers.find((p) => p.id === initialLocalPlayerId);
      const resolvedWinner = forcedWinner ?? winner ?? 'crew';

      setWinner(resolvedWinner);
      setPhase('game_over');

      const wasSaboteur = humanPlayer?.role === 'saboteur';
      const wasWorker = humanPlayer?.role === 'worker' || humanPlayer?.role === 'inspector';
      const didWin =
        (resolvedWinner === 'saboteur' && wasSaboteur) || (resolvedWinner === 'crew' && wasWorker);

      const saboteurId = finalPlayers.find((p) => p.role === 'saboteur')?.id;
      const saboteurExposed =
        saboteurId !== undefined &&
        finalPlayers.find((p) => p.id === saboteurId)?.isDetained === true;

      void saboteurStatsRepository
        .recordMatchCompletion({
          won: didWin,
          wasWorker,
          wasSaboteur,
          saboteurExposed,
          reactorCompleted: stateRef.current.reactorProgress >= 100,
          inspectionsConducted: 0,
        })
        .then(setCareerStats);
    },
    [initialLocalPlayerId, winner],
  );

  const advanceNextRound = useCallback(() => {
    const nextRound = stateRef.current.currentRound + 1;

    // Check win before advancing
    const winCheck = checkWinCondition({
      phase: 'round_summary',
      currentRound: stateRef.current.currentRound,
      totalRounds: stateRef.current.totalRounds,
      reactorProgress: stateRef.current.reactorProgress,
      meltdownStrikes: stateRef.current.meltdownStrikes,
      activeSector: stateRef.current.activeSector,
      players: stateRef.current.players,
      history: stateRef.current.history,
      chat: [],
      winner: null,
      winReason: '',
    });

    if (winCheck.winner || nextRound > stateRef.current.totalRounds) {
      setWinReason(winCheck.reason || 'All rounds completed.');
      finishMatch(winCheck.winner ?? 'crew');
      return;
    }

    const sectorIdx = (nextRound - 1) % SECTOR_MISSIONS.length;
    const nextSector = SECTOR_MISSIONS[sectorIdx];

    setCurrentRound(nextRound);
    setActiveSector(nextSector);
    setCurrentVotes({});

    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        selectedCard: null,
        hasLockedIn: false,
        votesAgainst: 0,
        hand: p.hand.length > 0 ? p.hand : generateHand(p.role === 'saboteur'),
      })),
    );

    setPhase('briefing');
    setTimeRemaining(4);
  }, [finishMatch]);

  // Phase timer countdown
  useEffect(() => {
    if (phase === 'lobby' || phase === 'game_over') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);

          const currPhase = stateRef.current.phase;
          if (currPhase === 'role_reveal') {
            setPhase('briefing');
            return 4;
          } else if (currPhase === 'briefing') {
            setPhase('contributing');
            return 20;
          } else if (currPhase === 'contributing') {
            // Auto-play first available card if player hasn't chosen
            const human = stateRef.current.players.find((p) => p.id === initialLocalPlayerId);
            if (human && !human.hasLockedIn && human.hand.length > 0) {
              lockInCard(human.hand[0]);
            }
            return 0;
          } else if (currPhase === 'reveal') {
            const isTrialRound = stateRef.current.currentRound % 3 === 0;
            if (isTrialRound) {
              setPhase('trial_vote');
              return 15;
            }
            setPhase('discussion');
            return 15;
          } else if (currPhase === 'discussion') {
            setPhase('round_summary');
            return 5;
          } else if (currPhase === 'trial_vote') {
            submitVote(null);
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
  }, [advanceNextRound, lockInCard, phase, submitVote, initialLocalPlayerId]);

  return {
    phase,
    currentRound,
    totalRounds,
    timeRemaining,
    reactorProgress,
    meltdownStrikes,
    activeSector,
    players,
    history,
    chat,
    currentVotes,
    winner,
    winReason,
    careerStats,
    config,
    localPlayerRole,
    setConfig,
    startSoloMatch,
    lockInCard,
    submitVote,
    sendChatMessage,
    advanceNextRound,
    playSound,
  };
}
