import { Router } from 'express';
import {
  listClassesController,
  getClassByIdController,
  createClassController,
  addUserToClassController,
  updateClassController,
  deleteClassController,
  updateUserClassController,
  removeUserFromClassController,
} from '../controllers/classesController';
import { ensureAuth } from '../middlewares/ensureAuth';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';

const router = Router();

router.use(ensureAuth);

router.get('/', listClassesController);
router.get('/:id', getClassByIdController);
router.post('/newClass', checkRole([USER_ROLES.ADMIN]), createClassController);
router.post('/:id/users', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), addUserToClassController);

// Permissões específicas pedidas
router.put('/:id', checkRole([USER_ROLES.ADMIN]), updateClassController);
router.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteClassController);
router.put('/:id/users/:userId', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), updateUserClassController);
router.delete('/:id/users/:userId', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), removeUserFromClassController);

export default router;