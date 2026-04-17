import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import {
  listClassesController,
  getClassByIdController,
  createClassController,
  updateClassController,
  deleteClassController,
  updateUserClassController,
  removeUserFromClassController,
  listClassStatusesController,
  createClassStatusController,
  updateClassStatusController,
  deleteClassStatusController,
} from '../controllers/classesController';

// ============================================================================
// CLASSES ROUTER (/classes)
// ============================================================================
export const classesRouter = Router();
classesRouter.get('/', listClassesController);
classesRouter.get('/:id', getClassByIdController);
classesRouter.post('/', checkRole([USER_ROLES.ADMIN]), createClassController);
classesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateClassController);
classesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteClassController);
classesRouter.put('/:id/users/:userId', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), updateUserClassController);
classesRouter.delete('/:id/users/:userId', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), removeUserFromClassController);

// ============================================================================
// CLASS STATUSES ROUTER (/class-statuses)
// ============================================================================
export const classStatusesRouter = Router();
classStatusesRouter.get('/', listClassStatusesController);
classStatusesRouter.post('/', checkRole([USER_ROLES.ADMIN]), createClassStatusController);
classStatusesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateClassStatusController);
classStatusesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteClassStatusController);
