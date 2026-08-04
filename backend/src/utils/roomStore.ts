export interface Player {
  id: string;        
  username: string;
  socketId: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
  createdAt: string;
}

export interface ActiveRoom {
  code: string;
  hostId: string;
  players: Map<string, Player>; 
  messages: ChatMessage[];
  status: string;
  lines: any[];
}

export const activeRooms = new Map<string, ActiveRoom>();