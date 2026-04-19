import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import * as StudiosController from '../controllers/studiosController';

// ============================================================================
// STUDIOS ROUTER (/studios)
// ============================================================================
export const studiosRouter = Router();

studiosRouter.get('/', StudiosController.listStudiosController);
studiosRouter.post('/', checkRole([USER_ROLES.ADMIN]), StudiosController.createStudioController);
studiosRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), StudiosController.updateStudioController);
studiosRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), StudiosController.deleteStudioController);

// ============================================================================
// MODALITIES ROUTER (/modalities)
// ============================================================================
export const modalitiesRouter = Router();

modalitiesRouter.get('/', StudiosController.listModalitiesController);
modalitiesRouter.post('/', checkRole([USER_ROLES.ADMIN]), StudiosController.createModalityController);
modalitiesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), StudiosController.updateModalityController);
modalitiesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), StudiosController.deleteModalityController);

// ============================================================================
// STUDIO MODALITIES ROUTER (/studio-modalities)
// ============================================================================
export const studioModalitiesRouter = Router();

studioModalitiesRouter.get('/', StudiosController.listStudioModalitiesController);
studioModalitiesRouter.post('/', checkRole([USER_ROLES.ADMIN]), StudiosController.createStudioModalityController);
studioModalitiesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), StudiosController.updateStudioModalityController);
studioModalitiesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), StudiosController.deleteStudioModalityController);
