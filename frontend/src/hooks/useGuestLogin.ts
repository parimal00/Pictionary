import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/authService";
import type { User } from "../types/user";

export function useGuestLogin(onSuccessCallback: (user: User) => void) {
  return useMutation({
    mutationFn: (username: string) => authService.guestLogin(username),
    onSuccess: (user) => {
      onSuccessCallback(user);
    },
  });
}