import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import * as SchoolController from '../controllers/schoolController';

// ============================================================================
// SCHOOL YEARS ROUTER (/school-years)
// ============================================================================
export const schoolYearsRouter = Router();

schoolYearsRouter.get('/', SchoolController.listSchoolYearsController);
schoolYearsRouter.post('/', checkRole([USER_ROLES.ADMIN]), SchoolController.createSchoolYearController);
schoolYearsRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), SchoolController.updateSchoolYearController);
schoolYearsRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), SchoolController.deleteSchoolYearController);

// ============================================================================
// SCHEDULE VACANCIES ROUTER (/schedule-vacancies)
// ============================================================================
export const scheduleVacanciesRouter = Router();

scheduleVacanciesRouter.get('/', SchoolController.listScheduleVacanciesController);
scheduleVacanciesRouter.get('/:id', SchoolController.getScheduleVacancyByIdController);
scheduleVacanciesRouter.get('/user/:userId', SchoolController.getScheduleVacanciesByUserIdController);
scheduleVacanciesRouter.post('/', SchoolController.createScheduleVacancyController);
scheduleVacanciesRouter.put('/:id', SchoolController.updateScheduleVacancyController);
scheduleVacanciesRouter.delete('/:id', SchoolController.deleteScheduleVacancyController);
