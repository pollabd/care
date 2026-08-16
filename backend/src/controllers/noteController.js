import mongoose from 'mongoose';
import Note from '../models/Note.js';

function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function listNotes(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.user.role === 'admin' && req.query.userId) {
      if (!mongoose.isValidObjectId(req.query.userId)) {
        return res.status(400).json({ message: 'Invalid user id' });
      }
      filter.owner = req.query.userId;
    } else if (req.user.role !== 'admin') {
      filter.owner = req.user._id;
    }
    const [notes, total] = await Promise.all([
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('owner', 'name email'),
      Note.countDocuments(filter)
    ]);
    return res.json({
      notes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list notes' });
  }
}

export async function createNote(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const note = await Note.create({ title, content, owner: req.user._id });
    return res.status(201).json({ note });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create note' });
  }
}

export async function getNote(req, res) {
  try {
    const note = await Note.findById(req.params.id).populate('owner', 'name email');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (req.user.role !== 'admin') {
      const ownerId = note.owner ? note.owner._id || note.owner : null;
      if (String(ownerId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not allowed to view this note' });
      }
    }
    return res.json({ note });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch note' });
  }
}

export async function updateNote(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (String(note.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed to update this note' });
    }
    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
    await note.save();
    return res.json({ note });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update note' });
  }
}

export async function deleteNote(req, res) {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    if (String(note.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not allowed to delete this note' });
    }
    await Note.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Note deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete note' });
  }
}
