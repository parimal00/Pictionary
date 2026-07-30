import { RoomModel, IRoom } from '../models/Room';
import crypto from 'node:crypto';

export interface CreateRoomInput {
  hostId: string;
  maxPlayers?: number;
  drawTime?: number;
  rounds?: number;
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
      code,
      hostId: input.hostId,
      settings: {
        maxPlayers: input.maxPlayers ?? 8,
        drawTime: input.drawTime ?? 80,
        rounds: input.rounds ?? 3,
      },
    });

    return room;
  },
};