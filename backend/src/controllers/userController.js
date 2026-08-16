import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Note from '../models/Note.js';
import Post from '../models/Post.js';

function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function listUsers(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);
    return res.json({
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list users' });
  }
}

export async function addUser(req, res) {
  try {
    const { name, email, password, role, interests } = req.body;
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
      role: role === 'admin' ? 'admin' : 'user',
      interests: Array.isArray(interests) ? interests : []
    });
    return res.status(201).json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to add user' });
  }
}

export async function updateUser(req, res) {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.role) updates.role = req.body.role;
    if (req.body.interests) updates.interests = req.body.interests;
    if (req.body.password) {
      updates.password = await bcrypt.hash(req.body.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update user' });
  }
}

export async function removeUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await Note.deleteMany({ owner: user._id });
    await Post.deleteMany({ author: user._id });
    return res.json({ message: 'User removed' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to remove user' });
  }
}

export async function groupedByInterests(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const result = await User.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          count: { $sum: 1 },
          users: { $push: { id: '$_id', name: '$name', email: '$email' } }
        }
      },
      { $sort: { count: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: 'total' }]
        }
      }
    ]);
    const total = result[0].total.length > 0 ? result[0].total[0].total : 0;
    return res.json({
      interests: result[0].data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Aggregation failed' });
  }
}
