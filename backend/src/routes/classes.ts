import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import * as ClassesController from '../controllers/classesController';
import { ensureAuth } from '../middlewares/ensureAuth';


// ============================================================================
// CLASSES ROUTER (/classes)
// ============================================================================
export const classesRouter = Router();

classesRouter.get('/', ensureAuth, ClassesController.listClassesController);
classesRouter.get('/:id', ensureAuth, ClassesController.getClassByIdController);
classesRouter.post('/', ensureAuth, checkRole([USER_ROLES.ADMIN]), ClassesController.createClassController);
classesRouter.put('/:id', ensureAuth, checkRole([USER_ROLES.ADMIN]), ClassesController.updateClassController);
classesRouter.delete('/:id', ensureAuth, checkRole([USER_ROLES.ADMIN]), ClassesController.deleteClassController);

classesRouter.put('/:id/users/:userId', ensureAuth, checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), ClassesController.updateUserClassController);
classesRouter.delete('/:id/users/:userId', ensureAuth, checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), ClassesController.removeUserFromClassController);

// ============================================================================
// CLASS STATUSES ROUTER (/class-statuses)
// ============================================================================
export const classStatusesRouter = Router();

classStatusesRouter.get('/', ensureAuth, ClassesController.listClassStatusesController);
classStatusesRouter.post('/', ensureAuth, checkRole([USER_ROLES.ADMIN]), ClassesController.createClassStatusController);
classStatusesRouter.put('/:id', ensureAuth, checkRole([USER_ROLES.ADMIN]), ClassesController.updateClassStatusController);
classStatusesRouter.delete('/:id', ensureAuth, checkRole([USER_ROLES.ADMIN]), ClassesController.deleteClassStatusController);

// ============================================================================
// COACHING ROUTER (/coaching)
// ============================================================================

export const coachingRouter = Router();

coachingRouter.post('/request',ensureAuth, checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER, USER_ROLES.PARENT,USER_ROLES.STUDENT]), ClassesController.requestCoachingController);
coachingRouter.patch('/:classId/confirm',ensureAuth, checkRole([USER_ROLES.ADMIN]), ClassesController.confirmCoachingController);
coachingRouter.post('/:classId/validate',ensureAuth, checkRole([USER_ROLES.TEACHER, USER_ROLES.PARENT, USER_ROLES.STUDENT]), ClassesController.validateCoachingController);
coachingRouter.post('/:classId/close',ensureAuth, checkRole([USER_ROLES.ADMIN]), ClassesController.closeCoachingController);