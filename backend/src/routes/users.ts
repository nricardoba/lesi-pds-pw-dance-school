import { Router } from 'express';
import {
  listUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
} from '../controllers/usersController';
import { ensureAuth } from '../middlewares/ensureAuth';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';

const router = Router();


router.use(ensureAuth);

router.get('/', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), listUsersController);
router.get('/:id', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), getUserByIdController);
router.post('/', checkRole([USER_ROLES.ADMIN]), createUserController);
router.put('/:id', checkRole([USER_ROLES.ADMIN]), updateUserController);

export default router;