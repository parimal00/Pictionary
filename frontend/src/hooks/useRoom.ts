import { useMutation } from "@tanstack/react-query";
import { roomApi, type Room } from "../services/roomService.ts";
import type { User } from "../types/user";

export function useCreateRoom(onSuccessCallback: (roomCode: string) => void) {
  return useMutation({
    mutationFn: (user: User) => roomApi.createRoom(user),
    onSuccess: (room: Room) => {
      onSuccessCallback(room.code);
    },
  });
}

export function useJoinRoom(onSuccessCallback: (roomCode: string) => void) {
  return useMutation({
    mutationFn: ({ user, roomCode }: { user: User; roomCode: string }) =>
      roomApi.joinRoom(user, roomCode),
    onSuccess: (room: Room) => {
      onSuccessCallback(room.code);
    },
  });
}