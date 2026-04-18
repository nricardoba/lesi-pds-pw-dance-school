import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import {
  listStudiosController,
  createStudioController,
  updateStudioController,
  deleteStudioController,
  listModalitiesController,
  createModalityController,
  updateModalityController,
  deleteModalityController,
  listStudioModalitiesController,
  createStudioModalityController,
  updateStudioModalityController,
  deleteStudioModalityController,
} from '../controllers/studiosController';

// ============================================================================
// STUDIOS ROUTER (/studios)
// ============================================================================
export const studiosRouter = Router();
studiosRouter.get('/', listStudiosController);
studiosRouter.post('/', checkRole([USER_ROLES.ADMIN]), createStudioController);
studiosRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateStudioController);
studiosRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteStudioController);

// ============================================================================
// MODALITIES ROUTER (/modalities)
// ============================================================================
export const modalitiesRouter = Router();
modalitiesRouter.get('/', listModalitiesController);
modalitiesRouter.post('/', checkRole([USER_ROLES.ADMIN]), createModalityController);
modalitiesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateModalityController);
modalitiesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteModalityController);

// ============================================================================
// STUDIO MODALITIES ROUTER (/studio-modalities)
// ============================================================================
export const studioModalitiesRouter = Router();
studioModalitiesRouter.get('/', listStudioModalitiesController);
studioModalitiesRouter.post('/', checkRole([USER_ROLES.ADMIN]), createStudioModalityController);
studioModalitiesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateStudioModalityController);
studioModalitiesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteStudioModalityController);

