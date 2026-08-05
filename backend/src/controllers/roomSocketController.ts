import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/roomSocketService.ts';
import { activeRooms,type Room } from '../utils/roomStore.ts';

export const handleJoinRoom = (
  io: Server, 
  socket: Socket, 
  emitSync: (code: string, room: Room) => void,
  emitHistory: (room: Room) => void
) => ({ roomCode, user }: { roomCode: string; user: { id: string; username: string } }) => {
  if (!roomCode || !user?.id) return;

  const code = RoomService.getNormalizedCode(roomCode);
  socket.join(code);

  const room = RoomService.getOrCreateRoom(code, user);
  RoomService.addOrUpdatePlayer(room, user, socket.id);

  emitSync(code, room);
  emitHistory(room);
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

  emitSync(code, room);
  emitStart(code, room.status);
};

export const handleSendMessage = (
  io: Server,
  socket: Socket
) => ({ roomCode, message }: { roomCode: string; message: { sender: string; text: string } }) => {
  if (!message?.text?.trim()) return;

  const code = RoomService.getNormalizedCode(roomCode);
  const room = activeRooms.get(code);
  if (!room) return;

  const chatEntry = RoomService.addMessage(room, message.sender, message.text.trim());
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