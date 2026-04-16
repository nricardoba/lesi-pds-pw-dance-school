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

const router = Router();

router.get('/', listClassesController);
router.get('/:id', getClassByIdController);
router.post('/newClass', createClassController);
router.post('/:id/users', addUserToClassController);
router.put('/:id', updateClassController);
router.delete('/:id', deleteClassController);
router.put('/:id/users/:userId', updateUserClassController);
router.delete('/:id/users/:userId', removeUserFromClassController);

export default router;