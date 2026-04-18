import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import {
  listUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  listUserTypesController,
  listUserClassRolesController,
  createUserClassRoleController,
  updateUserClassRoleController,
  deleteUserClassRoleController,
} from '../controllers/usersController';

// ============================================================================
// USERS ROUTER (/users)
// ============================================================================
export const usersRouter = Router();
usersRouter.get('/', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), listUsersController);
usersRouter.get('/:id', checkRole([USER_ROLES.ADMIN, USER_ROLES.TEACHER]), getUserByIdController);
usersRouter.post('/', checkRole([USER_ROLES.ADMIN]), createUserController);
usersRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateUserController);

// ============================================================================
// USER TYPES ROUTER (/user-types)
// ============================================================================
export const userTypesRouter = Router();
userTypesRouter.get('/', listUserTypesController);

// ============================================================================
// USER CLASS ROLES ROUTER (/user-class-roles)
// ============================================================================
export const userClassRolesRouter = Router();
userClassRolesRouter.get('/', listUserClassRolesController);
userClassRolesRouter.post('/', checkRole([USER_ROLES.ADMIN]), createUserClassRoleController);
userClassRolesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateUserClassRoleController);
userClassRolesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteUserClassRoleController);
