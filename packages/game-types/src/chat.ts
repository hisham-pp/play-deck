export interface ChatMessage {
  id: string;
  roomCode: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  createdAt: string;
  isSystem?: boolean;
}
