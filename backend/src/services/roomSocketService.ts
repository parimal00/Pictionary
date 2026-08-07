import { pl } from 'zod/locales';
import { activeRooms,type Room, type Player,type ChatMessage } from '../utils/roomStore.ts';

export class RoomService {
  public static getNormalizedCode(code: string): string {
    return code ? code.trim().toUpperCase() : '';
  }

  public static getOrCreateRoom(roomCode: string, hostUser: { id: string }): Room {
    const code = this.getNormalizedCode(roomCode);
    let room = activeRooms.get(code);

    if (!room) {
      console.log(`Creating new room with code: ${code}`);
      room = {
        code,
        hostId: hostUser.id,
        players: new Map(),
        messages: [],
        status: "LOBBY",
        lines: [],
        currentWord: '',
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
      hasGuessed: existingPlayer?.hasGuessed || false,
      isDrawer: existingPlayer?.isDrawer || false,
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
      console.log(`Deleting room with code: ${roomCode} as it has no remaining players.`);
      activeRooms.delete(roomCode);
      return null;
    }

    return {
      room,
      remainingPlayers: Array.from(room.players.values()),
    };
  }

  static startNewRound(room: Room, wordBank: string[]) {
    const playerList = Array.from(room.players.values());
    if (playerList.length === 0) return null;

    const randomDrawer = playerList[Math.floor(Math.random() * playerList.length)];
    const randomWord = wordBank[Math.floor(Math.random() * wordBank.length)];

    room.status = "PLAYING";
    room.drawerId = randomDrawer.id;
    room.currentWord = randomWord;

    room.players.forEach((p) => {
      p.hasGuessed = false;
    });
    

    return { drawer: randomDrawer, word: randomWord };
  }

  static authorizedToGuess(room: Room, userId: string): boolean {
      const player = room.players.get(userId);
        if (!player ) {
          return false;
        }

        if(room.drawerId === player.id){
          return false;
        }

        return true;
  }

  static alreadyGuessed(room: Room, userId: string): boolean {
    const player = room.players.get(userId);

      if (!player ) {
        return false;
      }

      if(player.hasGuessed){
        return true;
      }

      return false;
  }

  static guessedCorrectly(room: Room, text: string, userId: string): boolean {
    const player = room.players.get(userId);
      if (!player ) {
        return false;
      }

      const trimmedText = text.trim().toUpperCase();


      if (trimmedText === room.currentWord) {
      return true;
    }

      return false;
  }

  static markPlayerAsGuessed(room: Room, userId: string): void {
    const player = room.players.get(userId);
    if (player) {
      player.hasGuessed = true;
    }
  } 

  static updatePlayerScore(room: Room, userId: string, points: number): void {  
    const player = room.players.get(userId);
    if (player) {
      player.score += points;
    }
  } 
}