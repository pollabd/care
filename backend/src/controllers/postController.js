import mongoose from 'mongoose';
import Post from '../models/Post.js';

function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export async function listPosts(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email'),
      Post.countDocuments()
    ]);
    return res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to list posts' });
  }
}

export async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const post = await Post.create({ title, content, author: req.user._id });
    return res.status(201).json({ post });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create post' });
  }
}

export async function userPosts(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    let authorId;
    try {
      authorId = new mongoose.Types.ObjectId(req.params.userId);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const result = await Post.aggregate([
      { $match: { author: authorId } },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorInfo' } },
            { $unwind: '$authorInfo' },
            {
              $project: {
                title: 1,
                content: 1,
                createdAt: 1,
                author: { id: '$authorInfo._id', name: '$authorInfo.name', email: '$authorInfo.email' }
              }
            }
          ],
          total: [{ $count: 'total' }]
        }
      }
    ]);
    const total = result[0].total.length > 0 ? result[0].total[0].total : 0;
    return res.json({
      posts: result[0].data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user posts' });
  }
}
