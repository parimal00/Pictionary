const rooms = new Map();

export const createRoom = (roomId) => {
    const room = {
    id: roomId,
    host: hostSocketId,
    status: 'LOBBY', // 'LOBBY', 'PLAYING', 'GAME_OVER'
    currentWord: '',
    drawerId: null,
    players: new Map([
      [hostSocketId, { id: hostSocketId, name: hostName, score: 0, isHost: true }]
    ]),
  };
  rooms.set(roomId, room);
  return room;
}