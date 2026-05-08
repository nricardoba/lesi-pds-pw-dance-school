import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import {
  // => USERS
  listUsersService,
  getUserByIdService,
  getMyProfileService,
  createUserService,
  updateUserService,
  updateMyProfileService,
  
  // => USER TYPES
  listUserTypesService,

  // => USER CLASS ROLES
  listUserClassRolesService,
  createUserClassRoleService,
  updateUserClassRoleService,
  deleteUserClassRoleService,

  // => USER DETAILS (NIF, CONTACTS, STUDENT NUMBER)
  upsertUserNifService,
  deleteUserNifService,
  upsertStudentNumberService,
  deleteStudentNumberService,
  addUserContactService,
  deleteUserContactService,
  addUserAddressService,
  deleteUserAddressService,
} from '../services/users';

// ============================================================================
// USERS
// ============================================================================

export const listUsersController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listUsersService();
  return res.json(data);
});

export const getUserByIdController = catchAsync(async (req: Request, res: Response) => {
  const data = await getUserByIdService(req.params);
  return res.json(data);
});

export const getMyProfileController = catchAsync(async (_req: Request, res: Response) => {
  const userId = Number(res.locals.user.id);
  const data = await getMyProfileService(userId);
  return res.json(data);
});

export const createUserController = catchAsync(async (req: Request, res: Response) => {
  const data = await createUserService(req.body);
  return res.status(201).json(data);
});

export const updateUserController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateUserService(req.params, req.body);
  return res.json(data);
});

export const updateMyProfileController = catchAsync(async (req: Request, res: Response) => {
  const userId = Number(res.locals.user.id);
  const data = await updateMyProfileService(userId, req.body);
  return res.json(data);
});

// ============================================================================
// USER PROFILE DETAILS
// ============================================================================

export const upsertUserNifController = catchAsync(async (req: Request, res: Response) => {
  const data = await upsertUserNifService(req.params, req.body);
  return res.json(data);
});

export const deleteUserNifController = catchAsync(async (req: Request, res: Response) => {
  const data = await deleteUserNifService(req.params);
  return res.status(200).json(data);
});

export const upsertStudentNumberController = catchAsync(async (req: Request, res: Response) => {
  const data = await upsertStudentNumberService(req.params, req.body);
  return res.json(data);
});

export const deleteStudentNumberController = catchAsync(async (req: Request, res: Response) => {
  const data = await deleteStudentNumberService(req.params);
  return res.status(200).json(data);
});

export const addUserContactController = catchAsync(async (req: Request, res: Response) => {
  const data = await addUserContactService(req.params, req.body);
  return res.status(201).json(data);
});

export const deleteUserContactController = catchAsync(async (req: Request, res: Response) => {
  const data = await deleteUserContactService(req.params);
  return res.status(200).json(data);
});

export const addUserAddressController = catchAsync(async (req: Request, res: Response) => {
  const data = await addUserAddressService(req.params, req.body);
  return res.status(201).json(data);
});

export const deleteUserAddressController = catchAsync(async (req: Request, res: Response) => {
  const data = await deleteUserAddressService(req.params);
  return res.status(200).json(data);
});

// ============================================================================
// USER TYPES
// ============================================================================

export const listUserTypesController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listUserTypesService();
  return res.json(data);
});

// ============================================================================
// USER CLASS ROLES
// ============================================================================

export const listUserClassRolesController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listUserClassRolesService();
  return res.json(data);
});

export const createUserClassRoleController = catchAsync(async (req: Request, res: Response) => {
  const data = await createUserClassRoleService(req.body);
  return res.status(201).json(data);
});

export const updateUserClassRoleController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateUserClassRoleService(req.params, req.body);
  return res.json(data);
});

export const deleteUserClassRoleController = catchAsync(async (req: Request, res: Response) => {
  await deleteUserClassRoleService(req.params);
  return res.status(204).send();
});
