import { Router } from 'express';
import {
  listUsers,
  addUser,
  updateUser,
  removeUser,
  groupedByInterests
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/admin.js';

const router = Router();

router.use(protect);
router.use(adminOnly);

router.get('/', listUsers);
router.get('/grouped-by-interests', groupedByInterests);
router.post('/', addUser);
router.put('/:id', updateUser);
router.delete('/:id', removeUser);

export default router;
