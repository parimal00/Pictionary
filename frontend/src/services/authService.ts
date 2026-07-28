import { api } from "./axiosInstance";
import type { User } from "../types/user.js";

export interface GuestLoginResponse {
  status: "success" | "fail";
  data: {
    user: User;
  };
}

export const authService = {
  guestLogin: async (username: string): Promise<User> => {
    const response = await api.post<GuestLoginResponse>("/guest-login", { username });
    return response.data.data.user;
  },
};