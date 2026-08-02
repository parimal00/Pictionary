import type { Request, Response } from 'express';
import { userService } from '../services/userService.ts';

export const guestLogin = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const user = await userService.createGuestUser(username);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          username: user.username,
          isGuest: user.isGuest,
        },
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};