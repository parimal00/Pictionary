import type { Request, Response, NextFunction } from "express";
import { roomService } from "../services/roomService.ts";

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log(req.body)
    const room = await roomService.createRoom(req.body);
    res.status(201).json({
      status: "success",
      data: { room },
    });
  } catch (error) {
    next(error); // Passes Mongoose / ApiError exceptions to your global error handler
  }
};