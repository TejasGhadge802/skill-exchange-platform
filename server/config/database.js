import mongoose from 'mongoose';
import { env } from './env.js';
import '../models/index.js';

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn('MONGODB_URI is not configured; API will start without a database connection.');
    return;
  }
  await mongoose.connect(env.mongoUri);
  console.info(`MongoDB connected: ${mongoose.connection.host}`);
}
