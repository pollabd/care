import { Router } from 'express';
import {
  listNotes,
  createNote,
  getNote,
  updateNote,
  deleteNote
} from '../controllers/noteController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', listNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
