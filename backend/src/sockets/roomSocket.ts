import { Server, Socket } from 'socket.io';
import  { activeRooms,type ChatMessage, type Player } from '../utils/roomStore.ts';
import  type { JoinRoomPayload } from '../types/socket.ts';

export function registerRoomHandlers(io: Server, socket: Socket) {
  
  socket.on('join_room', ({ roomCode, user }: JoinRoomPayload) => {
    const code = roomCode.toUpperCase();
    socket.join(code);

    let room = activeRooms.get(code);
    if (!room) {
      room = { 
        code,
        hostId: user.id, 
        players: new Map(),
        messages: [],
        status: "LOBBY",
        lines: [],
      };
      activeRooms.set(code, room);
    }

    const player: Player = {
      id: user.id,
      username: user.username,
      socketId: socket.id,
      score: room.players.get(user.id)?.score || 0, 
    };

    room.players.set(user.id, player);

    const playerList = Array.from(room.players.values());

    io.to(code).emit('room_updated', {
      players: playerList,
      hostId: room.hostId,
      status: room.status,
    });

    socket.emit('chat_history', room.messages);
    socket.emit('drawing_history', room.lines);
  });

  socket.on('start_game',(roomCode: string) => {
   const room = activeRooms.get(roomCode);
    if (!room) return;

    room.status = "PLAYING";

    io.to(roomCode).emit("game_started", {
      players: room.players,
      hostId: room.hostId,
      status: room.status,
    });
  })

  // 4. Handle incoming chat messages
  socket.on('send_message', ({ roomCode, message }: { roomCode: string; message: { sender: string; text: string } }) => {
    const code = roomCode.toUpperCase();
    const room = activeRooms.get(code);
    if (!room) return;

    const chatEntry: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: message.sender,
      text: message.text,
      createdAt: new Date().toISOString(),
    };

    if (!room.messages) room.messages = [];

    room.messages.push(chatEntry);
    if (room.messages.length > 50) {
      room.messages.shift();
    }

    io.to(code).emit('receive_message', chatEntry);
  });

  socket.on('draw_line', ({ roomCode, lineData }) => {
    const code = roomCode.toUpperCase();
    const room = activeRooms.get(code);
    if (!room) return;
    room.lines.push(lineData);
    socket.to(code).emit('draw_line', lineData);
  });

  socket.on('clear_canvas', ({ roomCode }) => {
    const code = roomCode.toUpperCase();
    const room = activeRooms.get(code);
    if (!room) return;
    room.lines = [];
    socket.to(code).emit('clear_canvas');
  });

  socket.on('disconnecting', () => {
    socket.rooms.forEach((roomCode) => {
      const room = activeRooms.get(roomCode);
      if (room) {
        for (const [userId, player] of room.players.entries()) {
          if (player.socketId === socket.id) {
            room.players.delete(userId);
            break;
          }
        }

        if (room.players.size === 0) {
          activeRooms.delete(roomCode);
        } else {
          io.to(roomCode).emit('room_updated', {
            players: Array.from(room.players.values()),
            hostId: room.hostId,
          });
        }
      }
    });
  });
}