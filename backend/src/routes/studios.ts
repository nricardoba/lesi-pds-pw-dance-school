import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import * as StudiosController from '../controllers/studiosController';
import { ensureAuth } from '../middlewares/ensureAuth';


// ============================================================================
// STUDIOS ROUTER (/studios)
// ============================================================================
export const studiosRouter = Router();

studiosRouter.get('/studios', StudiosController.getAvailableStudios);
studiosRouter.get('/', StudiosController.listStudiosController);
studiosRouter.post('/', ensureAuth,checkRole([USER_ROLES.ADMIN]), StudiosController.createStudioController);
studiosRouter.put('/:id', ensureAuth,checkRole([USER_ROLES.ADMIN]), StudiosController.updateStudioController);
studiosRouter.delete('/:id', ensureAuth,checkRole([USER_ROLES.ADMIN]), StudiosController.deleteStudioController);

// ============================================================================
// MODALITIES ROUTER (/modalities)
// ============================================================================
export const modalitiesRouter = Router();

modalitiesRouter.get('/', StudiosController.listModalitiesController);
modalitiesRouter.get('/:id', StudiosController.getModalityByIdController);
modalitiesRouter.post('/', checkRole([USER_ROLES.ADMIN]), StudiosController.createModalityController);
modalitiesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), StudiosController.updateModalityController);
modalitiesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), StudiosController.deleteModalityController);

// ============================================================================
// STUDIO MODALITIES ROUTER (/studio-modalities)
// ============================================================================
export const studioModalitiesRouter = Router();

studioModalitiesRouter.get('/', StudiosController.listStudioModalitiesController);
studioModalitiesRouter.post('/', ensureAuth,checkRole([USER_ROLES.ADMIN]), StudiosController.createStudioModalityController);
studioModalitiesRouter.put('/:id', ensureAuth,checkRole([USER_ROLES.ADMIN]), StudiosController.updateStudioModalityController);
studioModalitiesRouter.delete('/:id', ensureAuth,checkRole([USER_ROLES.ADMIN]), StudiosController.deleteStudioModalityController);
