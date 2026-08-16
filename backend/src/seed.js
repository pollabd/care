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
    email: 'admin@gmail.com',
    password: adminPassword,
    role: 'admin',
    interests: ['management', 'security']
  });

  const pollab = await User.create({
    name: 'Pollab',
    email: 'pollab@gmail.com',
    password: userPassword,
    role: 'user',
    interests: ['chess', 'reading']
  });

  const jk = await User.create({
    name: 'JK',
    email: 'jk@gmail.com',
    password: userPassword,
    role: 'user',
    interests: ['chess', 'reading', 'cooking']
  });

  await Note.create([
    { title: 'Pollab first note', content: 'Content of Pollab first note', owner: pollab._id },
    { title: 'Pollab second note', content: 'Content of Pollab second note', owner: pollab._id },
    { title: 'JK private note', content: 'Content of JK private note', owner: jk._id }
  ]);

  await Post.create([
    { title: 'Pollab post one', content: 'Hello world from Pollab', author: pollab._id },
    { title: 'Pollab post two', content: 'Another post from Pollab', author: pollab._id },
    { title: 'JK post one', content: 'JK speaks to everyone', author: jk._id },
    { title: 'Admin post one', content: 'Admin announcement', author: admin._id }
  ]);

  console.log('Seed data created');
}
