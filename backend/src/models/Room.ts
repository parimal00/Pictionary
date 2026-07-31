import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document{
    code: String;
    hostId: String;
    settings:{
        maxPlayers: Number;
        drawTime: number;
        rounds: number;
    };
}

const RoomSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    hostId: { type: String, required: true },
    settings: {
      maxPlayers: { type: Number, default: 8, min: 2, max: 12 },
      drawTime: { type: Number, default: 80, min: 30, max: 180 },
      rounds: { type: Number, default: 3, min: 1, max: 10 },
    },
  },
  { timestamps: true }
);

export const RoomModel = mongoose.model<IRoom>('Room', RoomSchema);