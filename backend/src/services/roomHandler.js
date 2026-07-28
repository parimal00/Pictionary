
import {createRoom } from './roomService.js';
import { SOCKET_EVENTS } from '../socket/events.js';
export const registerRoomHandlers = (io, socket) => {
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId, callback) => {
        socket.join(roomId);
        console.log(`[Room Joined]: ${socket.id} joined room ${roomId}`);
        if(typeof callback === 'function'){
            callback({ success: true, message: `Joined room ${roomId}` });
        }
    });
}