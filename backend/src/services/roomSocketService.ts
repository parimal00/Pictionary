import { activeRooms,type Room, type Player,type ChatMessage } from '../utils/roomStore.ts';

export class RoomService {
  public static getNormalizedCode(code: string): string {
    return code ? code.trim().toUpperCase() : '';
  }

  public static getOrCreateRoom(roomCode: string, hostUser: { id: string }): Room {
    const code = this.getNormalizedCode(roomCode);
    let room = activeRooms.get(code);

    if (!room) {
      room = {
        code,
        hostId: hostUser.id,
        players: new Map(),
        messages: [],
        status: "LOBBY",
        lines: [],
      };
      activeRooms.set(code, room);
    }
    return room;
  }

  public static addOrUpdatePlayer(room: Room, user: { id: string; username: string }, socketId: string): Player {
    const existingPlayer = room.players.get(user.id);
    const player: Player = {
      id: user.id,
      username: user.username,
      socketId,
      score: existingPlayer?.score || 0,
    };
    room.players.set(user.id, player);
    return player;
  }

  public static addMessage(room: Room, sender: string, text: string): ChatMessage {
    const chatEntry: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender,
      text,
      createdAt: new Date().toISOString(),
    };

    room.messages.push(chatEntry);
    if (room.messages.length > 50) room.messages.shift();
    return chatEntry;
  }

  public static removeSocketPlayer(socketId: string, roomCode: string): { room: Room; remainingPlayers: Player[] } | null {
    const room = activeRooms.get(roomCode);
    if (!room) return null;

    for (const [userId, player] of room.players.entries()) {
      if (player.socketId === socketId) {
        room.players.delete(userId);
        break;
      }
    }

    if (room.players.size === 0) {
      activeRooms.delete(roomCode);
      return null;
    }

    return {
      room,
      remainingPlayers: Array.from(room.players.values()),
    };
  }
}