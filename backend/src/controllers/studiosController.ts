import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

import {
  // => STUDIOS
  getAvailableStudiosService,
  listStudiosService,
  createStudioService,
  updateStudioService,
  deleteStudioService,
  
  // => MODALITIES
  listModalitiesService,
  createModalityService,
  updateModalityService,
  deleteModalityService,

  // => STUDIO MODALITIES
  listStudioModalitiesService,
  createStudioModalityService,
  updateStudioModalityService,
  deleteStudioModalityService,
} from '../services/studios';

// ============================================================================
// STUDIOS
// ============================================================================


export const getAvailableStudios = catchAsync(async (req: Request, res: Response) => {
  const modalityId = Number(req.query.modalityId);
  const data = await getAvailableStudiosService(modalityId);
  return res.json(data);
});

export const listStudiosController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listStudiosService();
  return res.json(data);
});

export const createStudioController = catchAsync(async (req: Request, res: Response) => {
  const data = await createStudioService(req.body);
  return res.status(201).json(data);
});

export const updateStudioController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateStudioService(req.params, req.body);
  return res.json(data);
});

export const deleteStudioController = catchAsync(async (req: Request, res: Response) => {
  await deleteStudioService(req.params);
  return res.status(204).send();
});

// ============================================================================
// MODALITIES
// ============================================================================

export const listModalitiesController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listModalitiesService();
  return res.json(data);
});

export const createModalityController = catchAsync(async (req: Request, res: Response) => {
  const data = await createModalityService(req.body);
  return res.status(201).json(data);
});

export const updateModalityController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateModalityService(req.params, req.body);
  return res.json(data);
});

export const deleteModalityController = catchAsync(async (req: Request, res: Response) => {
  await deleteModalityService(req.params);
  return res.status(204).send();
});

// ============================================================================
// STUDIO MODALITIES
// ============================================================================

export const listStudioModalitiesController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listStudioModalitiesService();
  return res.json(data);
});

export const createStudioModalityController = catchAsync(async (req: Request, res: Response) => {
  const data = await createStudioModalityService(req.body);
  return res.status(201).json(data);
});

export const updateStudioModalityController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateStudioModalityService(req.params, req.body);
  return res.json(data);
});

export const deleteStudioModalityController = catchAsync(async (req: Request, res: Response) => {
  await deleteStudioModalityService(req.params);
  return res.status(204).send();
});
