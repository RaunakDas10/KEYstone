import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/keystone';

export const connectDB = async (): Promise<typeof mongoose | null> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${(error as Error).message}`);
    console.warn(`[MongoDB] Running in fallback mode. Ensure MongoDB is running at ${MONGODB_URI}`);
    return null;
  }
};

export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
