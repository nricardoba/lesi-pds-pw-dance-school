import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { ensureAuth } from '../middlewares/ensureAuth'; // Mantém-se para rotas que precisem de login sem restrição de Role
import { USER_ROLES } from '../utils/permissions';
import * as UsersController from '../controllers/usersController';

// ============================================================================
// USERS ROUTER (/users)
// ============================================================================
export const usersRouter = Router();

// Usando o nosso checkRole fundido (ele já faz a validação do token internamente)
usersRouter.get('/', ensureAuth, UsersController.listUsersController);
usersRouter.get('/me', ensureAuth, UsersController.getMyProfileController);
usersRouter.get('/:id', ensureAuth, UsersController.getUserByIdController);
usersRouter.post('/', checkRole([USER_ROLES.ADMIN]), UsersController.createUserController);
usersRouter.put('/me', ensureAuth, UsersController.updateMyProfileController);
usersRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), UsersController.updateUserController);

// => User Profile Details Routes
usersRouter.put('/:id/nif', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.upsertUserNifController);
usersRouter.delete('/:id/nif', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.deleteUserNifController);

usersRouter.put('/:id/student-number', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.upsertStudentNumberController);
usersRouter.delete('/:id/student-number', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.deleteStudentNumberController);

usersRouter.post('/:id/contacts', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.addUserContactController);
usersRouter.delete('/:id/contacts/:contactId', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.deleteUserContactController);

usersRouter.post('/:id/addresses', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.addUserAddressController);
usersRouter.delete('/:id/addresses/:userAddressId', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.deleteUserAddressController);

// ============================================================================
// USER TYPES ROUTER (/user-types)
// ============================================================================
export const userTypesRouter = Router();

// Se esta rota for livre só para users logados (não importa o tipo), usa o ensureAuth. Se for aberta a público, não tem middleware.
userTypesRouter.get('/', ensureAuth, UsersController.listUserTypesController);

// ============================================================================
// USER CLASS ROLES ROUTER (/user-class-roles)
// ============================================================================
export const userClassRolesRouter = Router();

userClassRolesRouter.get('/', ensureAuth, UsersController.listUserClassRolesController);
userClassRolesRouter.post('/', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.createUserClassRoleController);
userClassRolesRouter.put('/:id', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.updateUserClassRoleController);
userClassRolesRouter.delete('/:id', ensureAuth, checkRole([USER_ROLES.ADMIN]), UsersController.deleteUserClassRoleController);
