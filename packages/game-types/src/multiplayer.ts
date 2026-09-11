export type RoomStatus = 'open' | 'starting' | 'in-progress' | 'closed';

export interface Room {
  id: string;
  code: string;
  gameId: string;
  hostId: string;
  maxPlayers: number;
  status: RoomStatus;
  isPrivate: boolean;
  createdAt: string;
}

export interface TransportAdapter {
  connect(endpoint: string): Promise<void>;
  disconnect(): Promise<void>;
  send<T>(event: string, payload: T): void;
  on<T>(event: string, handler: (payload: T) => void): () => void;
}

export interface PresenceUser {
  id: string;
  displayName: string;
  status: 'online' | 'in-game' | 'away';
  lastActiveAt: string;
}
