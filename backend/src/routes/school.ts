import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import {
  listSchoolYearsController,
  createSchoolYearController,
  updateSchoolYearController,
  deleteSchoolYearController,
} from '../controllers/schoolController';

export const schoolYearsRouter = Router();
schoolYearsRouter.get('/', listSchoolYearsController);
schoolYearsRouter.post('/', checkRole([USER_ROLES.ADMIN]), createSchoolYearController);
schoolYearsRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateSchoolYearController);
schoolYearsRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteSchoolYearController);
