import { Router } from 'express';
import {
  listUserTypesController,
  listClassStatusesController,
  listUserClassRolesController,
  listModalitiesController,
  listStudiosController,
  listSchoolYearsController,
  listStudioModalitiesController,
  createSchoolYearController,
  createClassStatusController,
  createModalityController,
  createStudioController,
  createStudioModalityController,
  createUserClassRoleController,
  updateSchoolYearController,
  updateClassStatusController,
  updateModalityController,
  updateStudioController,
  updateStudioModalityController,
  updateUserClassRoleController,
  deleteUserClassRoleController,
  deleteSchoolYearController,
  deleteClassStatusController,
  deleteModalityController,
  deleteStudioController,
  deleteStudioModalityController,
} from '../controllers/referencesController';
import { ensureAuth } from '../middlewares/ensureAuth';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';

const router = Router();

router.use(ensureAuth);

// GET routes (open to all authed users)
router.get('/user-types', listUserTypesController);
router.get('/class-statuses', listClassStatusesController);
router.get('/user-class-roles', listUserClassRolesController);
router.get('/modalities', listModalitiesController);
router.get('/studios', listStudiosController);
router.get('/school-years', listSchoolYearsController);
router.get('/studio-modalities', listStudioModalitiesController);

// Require admin for POST, PUT, DELETE
router.use(checkRole([USER_ROLES.ADMIN]));

// POST routes
router.post('/school-years', createSchoolYearController);
router.post('/class-statuses', createClassStatusController);
router.post('/modalities', createModalityController);
router.post('/studios', createStudioController);
router.post('/studio-modalities', createStudioModalityController);
router.post('/user-class-roles', createUserClassRoleController);

// PUT routes
router.put('/school-years/:id', updateSchoolYearController);
router.put('/class-statuses/:id', updateClassStatusController);
router.put('/modalities/:id', updateModalityController);
router.put('/studios/:id', updateStudioController);
router.put('/studio-modalities/:id', updateStudioModalityController);
router.put('/user-class-roles/:id', updateUserClassRoleController);

// DELETE routes
router.delete('/user-class-roles/:id', deleteUserClassRoleController);
router.delete('/school-years/:id', deleteSchoolYearController);
router.delete('/class-statuses/:id', deleteClassStatusController);
router.delete('/modalities/:id', deleteModalityController);
router.delete('/studios/:id', deleteStudioController);
router.delete('/studio-modalities/:id', deleteStudioModalityController);

export default router;