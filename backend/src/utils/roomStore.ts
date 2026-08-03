export interface Player {
  id: string;        
  username: string;
  socketId: string;
  score: number;
}

export interface ActiveRoom {
  code: string;
  hostId: string;
  players: Map<string, Player>; 
}

export const activeRooms = new Map<string, ActiveRoom>();