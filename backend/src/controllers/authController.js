import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'this is a secret key for backend', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

export async function register(req, res) {
  try {
    const { name, email, password, interests } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      interests: Array.isArray(interests) ? interests : []
    });
    const token = signToken(user._id);
    return res.status(201).json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
}

export async function getMe(req, res) {
  return res.json({ user: req.user });
}
