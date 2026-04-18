import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import {
  listSchoolYearsController,
  createSchoolYearController,
  updateSchoolYearController,
  deleteSchoolYearController,
  listScheduleVacanciesController,
  getScheduleVacancyByIdController,
  getScheduleVacanciesByUserIdController,
  createScheduleVacancyController,
  updateScheduleVacancyController,
  deleteScheduleVacancyController,
} from '../controllers/schoolController';

// ============================================================================
// SCHOOL YEARS ROUTER (/school-years)
// ============================================================================
export const schoolYearsRouter = Router();
schoolYearsRouter.get('/', listSchoolYearsController);
schoolYearsRouter.post('/', checkRole([USER_ROLES.ADMIN]), createSchoolYearController);
schoolYearsRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), updateSchoolYearController);
schoolYearsRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), deleteSchoolYearController);

// ============================================================================
// SCHEDULE VACANCIES ROUTER (/schedule-vacancies)
// ============================================================================
export const scheduleVacanciesRouter = Router();
scheduleVacanciesRouter.get('/', listScheduleVacanciesController);
scheduleVacanciesRouter.get('/:id', getScheduleVacancyByIdController);
scheduleVacanciesRouter.get('/user/:userId', getScheduleVacanciesByUserIdController);
scheduleVacanciesRouter.post('/', createScheduleVacancyController);
scheduleVacanciesRouter.put('/:id', updateScheduleVacancyController);
scheduleVacanciesRouter.delete('/:id', deleteScheduleVacancyController);
