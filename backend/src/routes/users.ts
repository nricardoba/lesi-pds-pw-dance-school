import { Router } from 'express';
import {
  listUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
} from '../controllers/usersController';

const router = Router();

router.get('/', listUsersController);
router.get('/:id', getUserByIdController);
router.post('/', createUserController);
router.put('/:id', updateUserController);

export default router;