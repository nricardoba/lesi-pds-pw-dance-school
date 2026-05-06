import { Router } from 'express';
import { checkRole } from '../middlewares/checkRole';
import { USER_ROLES } from '../utils/permissions';
import * as SchoolController from '../controllers/schoolController';
import { ensureAuth } from '../middlewares/ensureAuth';

// ============================================================================
// SCHOOL YEARS ROUTER (/school-years)
// ============================================================================
export const schoolYearsRouter = Router();

schoolYearsRouter.get('/', SchoolController.listSchoolYearsController);
schoolYearsRouter.post('/', ensureAuth,checkRole([USER_ROLES.ADMIN]), SchoolController.createSchoolYearController);
schoolYearsRouter.put('/:id', ensureAuth,checkRole([USER_ROLES.ADMIN]), SchoolController.updateSchoolYearController);
schoolYearsRouter.delete('/:id', ensureAuth,checkRole([USER_ROLES.ADMIN]), SchoolController.deleteSchoolYearController);

// ============================================================================
// SCHEDULE VACANCIES ROUTER (/schedule-vacancies)
// ============================================================================
export const scheduleVacanciesRouter = Router();

scheduleVacanciesRouter.get('/', ensureAuth,SchoolController.listScheduleVacanciesController);
scheduleVacanciesRouter.get('/:id', ensureAuth,SchoolController.getScheduleVacancyByIdController);
scheduleVacanciesRouter.get('/user/:userId', ensureAuth,checkRole([USER_ROLES.ADMIN]), SchoolController.getScheduleVacanciesByUserIdController);
scheduleVacanciesRouter.post('/', ensureAuth,checkRole([USER_ROLES.ADMIN]), SchoolController.createScheduleVacancyController);
scheduleVacanciesRouter.put('/:id', ensureAuth,checkRole([USER_ROLES.ADMIN]), SchoolController.updateScheduleVacancyController);
scheduleVacanciesRouter.delete('/:id', ensureAuth, checkRole([USER_ROLES.ADMIN]), SchoolController.deleteScheduleVacancyController);