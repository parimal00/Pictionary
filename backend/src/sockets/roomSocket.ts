import { Server, Socket } from 'socket.io';
import { activeRooms, type Room } from '../utils/roomStore.ts';
import { 
  handleJoinRoom, 
  handleStartRound, 
  handleSendMessage,
  handleDrawLine, 
  handleClearCanvas, 
  handleDisconnecting, 
  getLinesHistory
} from '../controllers/roomSocketController.ts';
import { get } from 'mongoose';

export function registerRoomHandlers(io: Server, socket: Socket) { 
  const emitGameStarted = (code: string, status: string) => {
    io.to(code).emit('game_started', { status });
  };
  const emitRoomSync = (code: string, room: Room) => {
    io.to(code).emit('room_updated', {
      players: Array.from(room.players.values()),
      hostId: room.hostId,
      status: room.status,
    });
  };
   const emitUserHistory = (room: Room) => {
    socket.emit('chat_history', room.messages);
    socket.emit('drawing_history', room.lines);
  };

  socket.on('join_room', handleJoinRoom(io, socket));
  socket.on('start_game', handleStartRound(io, socket));
  socket.on('send_message', handleSendMessage(io, socket));
  socket.on('draw_line', handleDrawLine(socket));
  socket.on('get_lines_history',getLinesHistory(socket));
  socket.on('clear_canvas', handleClearCanvas(socket));
  socket.on('disconnecting', handleDisconnecting(socket, emitRoomSync));
}