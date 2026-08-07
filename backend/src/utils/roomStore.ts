export interface Player {
  id: string;        
  username: string;
  socketId: string;
  score: number;
  hasGuessed: boolean;
  isDrawer: boolean
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isSystem?: boolean;
  createdAt: string;
}

export interface Room {
  code: string;
  hostId: string;
  players: Map<string, Player>; 
  messages: ChatMessage[];
  status: string;
  lines: any[];
  drawerId?: string;
  currentWord?: string;
}

export const activeRooms = new Map<string, Room>();