import { Router } from 'express';
import { listPosts, createPost, userPosts } from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listPosts);
router.post('/', createPost);
router.get('/user/:userId', userPosts);

export default router;
