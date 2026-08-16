import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Note from './models/Note.js';
import Post from './models/Post.js';

export async function seed() {
  const count = await User.countDocuments();
  if (count > 0) {
    return;
  }

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin',
    interests: ['management', 'security']
  });

  const alice = await User.create({
    name: 'Alice',
    email: 'alice@example.com',
    password: userPassword,
    role: 'user',
    interests: ['chess', 'reading']
  });

  const bob = await User.create({
    name: 'Bob',
    email: 'bob@example.com',
    password: userPassword,
    role: 'user',
    interests: ['chess', 'reading', 'cooking']
  });

  await Note.create([
    { title: 'Alice first note', content: 'Content of Alice first note', owner: alice._id },
    { title: 'Alice second note', content: 'Content of Alice second note', owner: alice._id },
    { title: 'Bob private note', content: 'Content of Bob private note', owner: bob._id }
  ]);

  await Post.create([
    { title: 'Alice post one', content: 'Hello world from Alice', author: alice._id },
    { title: 'Alice post two', content: 'Another post from Alice', author: alice._id },
    { title: 'Bob post one', content: 'Bob speaks to everyone', author: bob._id },
    { title: 'Admin post one', content: 'Admin announcement', author: admin._id }
  ]);

  console.log('Seed data created');
}
