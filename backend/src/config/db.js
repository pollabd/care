import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/secure_notes'; // docker mongo
  const parsedUri = new URL(uri);
  
  if (!parsedUri.pathname || parsedUri.pathname === '/') {
    throw new Error('MONGO_URI must include a database name (use /secure_notes)');
  }
  
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
