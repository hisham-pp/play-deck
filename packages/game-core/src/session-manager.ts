import {
  GameSession,
  GameSessionPlayer,
  Player,
  GameDefinition,
  GameResult,
} from '@playdeck/game-types';
import { generateId } from '@playdeck/shared';

export class SessionManager {
  static createSession<TState = unknown>(
    game: GameDefinition<TState>,
    hostPlayer: Player,
  ): GameSession<TState> {
    const now = new Date().toISOString();
    const hostSessionPlayer: GameSessionPlayer = {
      id: hostPlayer.id,
      displayName: hostPlayer.displayName,
      avatar: hostPlayer.avatar,
      isHost: true,
      score: 0,
    };

    const initialState = game.createGame ? game.createGame() : ({} as TState);

    return {
      id: generateId('session'),
      gameId: game.id,
      players: [hostSessionPlayer],
      status: 'playing',
      createdAt: now,
      updatedAt: now,
      state: initialState,
    };
  }

  static addPlayer(session: GameSession, player: Player): GameSession {
    if (session.status !== 'waiting' && session.status !== 'playing') {
      throw new Error(`Cannot add player to session with status: ${session.status}`);
    }

    const alreadyJoined = session.players.some((p) => p.id === player.id);
    if (alreadyJoined) return session;

    const newPlayer: GameSessionPlayer = {
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar,
      isHost: false,
      score: 0,
    };

    return {
      ...session,
      players: [...session.players, newPlayer],
      updatedAt: new Date().toISOString(),
    };
  }

  static finalizeSession(
    session: GameSession,
    winnerPlayerId?: string,
    isDraw?: boolean,
  ): { session: GameSession; result: GameResult } {
    const now = new Date().toISOString();
    const startTime = new Date(session.createdAt).getTime();
    const endTime = new Date(now).getTime();
    const durationSeconds = Math.max(1, Math.floor((endTime - startTime) / 1000));

    const updatedSession: GameSession = {
      ...session,
      status: 'completed',
      endedAt: now,
      updatedAt: now,
      winnerPlayerId,
    };

    const result: GameResult = {
      sessionId: session.id,
      gameId: session.gameId,
      winnerPlayerId,
      isDraw,
      durationSeconds,
      completedAt: now,
      players: session.players.map((p) => ({
        id: p.id,
        displayName: p.displayName,
        score: p.score,
        rank: p.id === winnerPlayerId ? 1 : 2,
      })),
    };

    return { session: updatedSession, result };
  }
}
