import { api } from "./axiosInstance";
import type { User } from "../types/user";

export interface Room {
  id: string;
  code: string;
  hostId: string;
  players: User[];
  status: "LOBBY" | "PLAYING" | "ENDED";
}

export const roomApi = {
  createRoom: async (user: User): Promise<Room> => {
    const response = await api.post("/rooms/create", {
      user,
      maxPlayers: 8,
      drawTime: 80,
      rounds: 3,
    });
    return response.data.data.room;
  },

  joinRoom: async (user: User, roomCode: string): Promise<Room> => {
    const response = await api.post("/rooms/join", { user, roomCode });
    return response.data.data.room;
  },
};