import { Server, Socket } from 'socket.io';
import  { activeRooms, type Player } from '../utils/roomStore.ts';
import  type { JoinRoomPayload } from '../types/socket.ts';

export function registerRoomHandlers(io: Server, socket: Socket) {
  
  socket.on('join_room', ({ roomCode, user }: JoinRoomPayload) => {
    const code = roomCode.toUpperCase();
    socket.join(code);

    let room = activeRooms.get(code);
    if (!room) {
      room = { code, hostId: user.id, players: new Map() };
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
    });
  });

  socket.on('start_game',(roomCode: string) => {
    const code = roomCode.toUpperCase();
  
  io.to(code).emit('game_started');
  })


  socket.on('draw_line', ({ roomCode, lineData }) => {
  const code = roomCode.toUpperCase();
  socket.to(code).emit('draw_line', lineData);
});

socket.on('clear_canvas', ({ roomCode }) => {
  const code = roomCode.toUpperCase();
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