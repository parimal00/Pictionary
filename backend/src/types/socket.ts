export interface UserPayload {
  id: string;
  username: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  user: UserPayload;
}