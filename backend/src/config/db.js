import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/secure_notes';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
