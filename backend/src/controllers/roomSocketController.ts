import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/roomSocketService.ts';
import { activeRooms,type Room } from '../utils/roomStore.ts';
import { pl } from 'zod/locales';
const WORD_BANK = ['APPLE', 'BANANA', 'ELEPHANT', 'GUITAR', 'MOUNTAIN', 'PIZZA', 'ROCKET'];
export const handleJoinRoom = (
  io: Server, 
  socket: Socket, 
) => ({ roomCode, user }: { roomCode: string; user: { id: string; username: string } }) => {
  if (!roomCode || !user?.id) return;

  const code = RoomService.getNormalizedCode(roomCode);
  socket.join(code);

  const room = RoomService.getOrCreateRoom(code, user);

  RoomService.addOrUpdatePlayer(room, user, socket.id);

  console.log("lines", room.lines)
  socket.emit('chat_history', room.messages);
  socket.emit('drawing_history', room.lines);

  // io.to(code).emit('chat_history', room.messages);
  // io.to(code).emit('drawing_history', room.lines);
  io.to(code).emit('room_updated', {
      players: Array.from(room.players.values()),
      hostId: room.hostId,
      status: room.status,
    });
  console.log("on join room", room.status)
};

export const handleStartGame = (
  io: Server, 
  socket: Socket, 
  emitSync: (code: string, room: Room) => void,
  emitStart: (code: string, status: string) => void
) => (roomCode: string) => {
  const code = RoomService.getNormalizedCode(roomCode);
  const room = activeRooms.get(code);
  if (!room) return;

  room.status = "PLAYING";

  const { drawer, word } = RoomService.startNewRound(room, WORD_BANK) || {};
  if (!drawer || !word) return;

  const systemMsg = RoomService.addMessage(
    room, 
    'System', 
    `${drawer.username} is drawing now!`
  );

  io.to(code).emit('receive_message', systemMsg);
  io.to(drawer.socketId).emit('new_round', { drawer, word });  
  io.to(code).emit('game_started', { status: room.status });
  io.to(code).emit('room_updated', {
      players: Array.from(room.players.values()),
      hostId: room.hostId,
      status: room.status,
    });
    console.log("game started", room.players)
};

export const handleSendMessage = (
  io: Server,
  socket: Socket
) => ({ roomCode, message }: { roomCode: string; message: { sender: string; text: string } }) => {
  if (!message?.text?.trim()) return;

  const code = RoomService.getNormalizedCode(roomCode);
  const room = activeRooms.get(code);

  
  if (!room) return;
  const player = room.players.get(message.sender);
  if(!player) return;

  if(!RoomService.authorizedToGuess(room, player.id)){
    return;
  }

  if(RoomService.alreadyGuessed(room, message.sender)){
    return;
  }

  if(RoomService.guessedCorrectly(room, message.text, player.id)){
    message = RoomService.addMessage(room, 'System', `${player?.username} guessed the word correctly`);
    RoomService.markPlayerAsGuessed(room, player.id);
    RoomService.updatePlayerScore(room, player.id, 10);
    io.to(code).emit('receive_message', message);
    return;
  }

  const chatEntry = RoomService.addMessage(room, player?.username || 'Unknown', message.text.trim());
    io.to(code).emit('receive_message', chatEntry);

};

export const handleDrawLine = (socket: Socket) => 
  ({ roomCode, lineData }: { roomCode: string; lineData: any }) => {
    const code = RoomService.getNormalizedCode(roomCode);
    const room = activeRooms.get(code);
    if (!room || !lineData) return;

    room.lines.push(lineData);
    socket.to(code).emit('draw_line', lineData);
  };

export const handleClearCanvas = (socket: Socket) => 
  ({ roomCode }: { roomCode: string }) => {
    const code = RoomService.getNormalizedCode(roomCode);
    const room = activeRooms.get(code);
    if (!room) return;

    room.lines = [];
    socket.to(code).emit('clear_canvas');
  };

export const getLinesHistory = (socket: Socket) => (roomCode: string) => {
  const room = activeRooms.get(roomCode);
  if (room) {
    socket.emit('drawing_history', room.lines);
  }
}

export const handleDisconnecting = (
  socket: Socket, 
  emitSync: (code: string, room: Room) => void
) => () => {
  socket.rooms.forEach((roomCode) => {
    const result = RoomService.removeSocketPlayer(socket.id, roomCode);
    if (result) {
      emitSync(roomCode, result.room);
    }
  });
};