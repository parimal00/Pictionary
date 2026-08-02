import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  isGuest: boolean;
  avatarUrl?: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 15,
  },
  isGuest: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export const UserModel = mongoose.model<IUser>('User', userSchema);