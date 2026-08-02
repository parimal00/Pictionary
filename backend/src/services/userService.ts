import  { UserModel, type IUser } from '../models/userModel.ts';

export const userService = {
  createGuestUser: async (username: string): Promise<IUser> => {
    const finalUsername = username.trim();

    const user = await UserModel.create({
      username: finalUsername,
      isGuest: true,
    });

    return user;
  },
};