import { RoomModel, type IRoom } from '../models/Room.ts';
import crypto from 'node:crypto';

export interface CreateRoomInput {
  hostId: string;
  settings?: {
    maxPlayers?: number;
    drawTime?: number;
    rounds?: number;
  };
}

const generateRoomCode = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // Generates 6-character code
};

export const roomService = {
  /**
   * Creates a new game room and saves it to MongoDB.
   */
  createRoom: async (input: CreateRoomInput): Promise<IRoom> => {
    const code = generateRoomCode();

    const room = await RoomModel.create({
      code: code,
      hostId: input.hostId,
      settings: {
        maxPlayers: input.settings?.maxPlayers ?? 8,
        drawTime: input.settings?.drawTime ?? 80,
        rounds: input.settings?.rounds ?? 3,
      },
    });

    return room;
  },
};