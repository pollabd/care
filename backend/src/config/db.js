import mongoose from 'mongoose';

function getDbName(uri) {
  const rest = uri.split('://')[1] || '';
  const slash = rest.indexOf('/');
  if (slash === -1) {
    return '';
  }
  return rest.slice(slash + 1).split('?')[0];
}

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/secure_notes'; // docker mongo
  if (!getDbName(uri)) {
    throw new Error('MONGO_URI must include a database name (use /secure_notes)');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
