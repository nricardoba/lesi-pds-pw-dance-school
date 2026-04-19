import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import {
  // => CLASSES
  listClassesService,
  getClassByIdService,
  createClassService,
  addUserToClassService,
  updateClassService,
  deleteClassService,
  updateUserClassService,
  removeUserFromClassService,
  
  // => CLASS STATUSES
  listClassStatusesService,
  createClassStatusService,
  updateClassStatusService,
  deleteClassStatusService,
} from '../services/classes';

// ============================================================================
// CLASSES & ENROLLMENTS
// ============================================================================

export const listClassesController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listClassesService();
  return res.json(data);
});

export const getClassByIdController = catchAsync(async (req: Request, res: Response) => {
  const data = await getClassByIdService(req.params);
  return res.json(data);
});

export const createClassController = catchAsync(async (req: Request, res: Response) => {
  const data = await createClassService(req.body);
  return res.status(201).json(data);
});

export const addUserToClassController = catchAsync(async (req: Request, res: Response) => {
  const data = await addUserToClassService(req.params, req.body);
  return res.status(201).json(data);
});

export const updateClassController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateClassService(req.params, req.body);
  return res.json(data);
});

export const deleteClassController = catchAsync(async (req: Request, res: Response) => {
  await deleteClassService(req.params);
  return res.status(204).send();
});

export const updateUserClassController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateUserClassService(req.params, req.body);
  return res.json(data);
});

export const removeUserFromClassController = catchAsync(async (req: Request, res: Response) => {
  await removeUserFromClassService(req.params);
  return res.status(204).send();
});

// ============================================================================
// CLASS STATUSES
// ============================================================================

export const listClassStatusesController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listClassStatusesService();
  return res.json(data);
});

export const createClassStatusController = catchAsync(async (req: Request, res: Response) => {
  const data = await createClassStatusService(req.body);
  return res.status(201).json(data);
});

export const updateClassStatusController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateClassStatusService(req.params, req.body);
  return res.json(data);
});

export const deleteClassStatusController = catchAsync(async (req: Request, res: Response) => {
  await deleteClassStatusService(req.params);
  return res.status(204).send();
});
