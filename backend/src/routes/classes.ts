import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import * as ClassesController from '../controllers/classesController';

// ============================================================================
// CLASSES ROUTER (/classes)
// ============================================================================
export const classesRouter = Router();

classesRouter.get('/', ClassesController.listClassesController);
classesRouter.get('/:id', ClassesController.getClassByIdController);
classesRouter.post('/', checkRole([USER_ROLES.ADMIN]), ClassesController.createClassController);
classesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), ClassesController.updateClassController);
classesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), ClassesController.deleteClassController);

classesRouter.put('/:id/users/:userId', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), ClassesController.updateUserClassController);
classesRouter.delete('/:id/users/:userId', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), ClassesController.removeUserFromClassController);

// ============================================================================
// CLASS STATUSES ROUTER (/class-statuses)
// ============================================================================
export const classStatusesRouter = Router();

classStatusesRouter.get('/', ClassesController.listClassStatusesController);
classStatusesRouter.post('/', checkRole([USER_ROLES.ADMIN]), ClassesController.createClassStatusController);
classStatusesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), ClassesController.updateClassStatusController);
classStatusesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), ClassesController.deleteClassStatusController);
