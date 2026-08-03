import type { Request, Response, NextFunction } from "express";
import { roomService } from "../services/roomService.ts";
import { RoomModel } from "../models/Room.ts";

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const room = await roomService.createRoom(req.body);
    res.status(201).json({
      status: "success",
      data: { room },
    });
  } catch (error) {
    next(error); 
  }
};


export const joinRoom = async (req: Request, res: Response) => {
  try {
    const { roomCode, user } = req.body;
    const formattedCode = roomCode.trim().toUpperCase();

    const room = await RoomModel.findOne({ code: formattedCode });

    if (!room) {
      return res.status(404).json({ message: 'Room not found. Check the code and try again.' });
    }

    if (room.status === 'ENDED') {
      return res.status(400).json({ message: 'This game has already ended.' });
    }

    // Return room details to client
    res.status(200).json({
      status: 'success',
      data: { room },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error joining room' });
  }
};