import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    console.log("connected db")
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pictionary'
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1); 
  }
};