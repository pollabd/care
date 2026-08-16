import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seed } from './seed.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import noteRoutes from './routes/notes.js';
import postRoutes from './routes/posts.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT || 4000;

await connectDB();
await seed();

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
