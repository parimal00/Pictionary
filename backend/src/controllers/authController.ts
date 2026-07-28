import * as authService from '../services/authService.ts';
// import { ApiError } from '../utils/apiError'
import express from 'express';
import type { Request, Response, NextFunction } from 'express'; 
interface GuestLoginBody {
    username: string;
}
// type Request = express.Request;
// type Response = express.Response;
// type NextFunction = express.NextFunction;
export const guestLogin = async (
        req: Request<{}, {}, GuestLoginBody>,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
  try {
    const { username } = req.body;
    const user = authService.createGuestUser(username);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}