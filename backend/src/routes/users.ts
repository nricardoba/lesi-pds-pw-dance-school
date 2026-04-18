import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import {
  listUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  upsertUserNifController,
  deleteUserNifController,
  upsertStudentNumberController,
  deleteStudentNumberController,
  addUserContactController,
  deleteUserContactController,
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

// => User Profile Details Routes
usersRouter.put('/:id/nif', checkRole([USER_ROLES.ADMIN]), upsertUserNifController);
usersRouter.delete('/:id/nif', checkRole([USER_ROLES.ADMIN]), deleteUserNifController);

usersRouter.put('/:id/student-number', checkRole([USER_ROLES.ADMIN]), upsertStudentNumberController);
usersRouter.delete('/:id/student-number', checkRole([USER_ROLES.ADMIN]), deleteStudentNumberController);

usersRouter.post('/:id/contacts', checkRole([USER_ROLES.ADMIN]), addUserContactController);
usersRouter.delete('/:id/contacts/:contactId', checkRole([USER_ROLES.ADMIN]), deleteUserContactController);

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
