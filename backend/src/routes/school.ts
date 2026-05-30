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

scheduleVacanciesRouter.get('/', checkRole([USER_ROLES.ADMIN]), SchoolController.listScheduleVacanciesController);
scheduleVacanciesRouter.get('/all', checkRole([USER_ROLES.ADMIN]), SchoolController.getAllScheduleSubmissionsController);
scheduleVacanciesRouter.get('/me', checkRole([USER_ROLES.TEACHER]), SchoolController.getMyScheduleVacanciesController);
scheduleVacanciesRouter.get('/me/submissions', checkRole([USER_ROLES.TEACHER]), SchoolController.getMyScheduleSubmissionsController);
scheduleVacanciesRouter.get('/me/latest', checkRole([USER_ROLES.TEACHER]), SchoolController.getMyLatestSubmissionStatusController);
scheduleVacanciesRouter.get('/user/:userId/submissions', checkRole([USER_ROLES.ADMIN]), SchoolController.getScheduleSubmissionsController);
scheduleVacanciesRouter.get('/user/:userId/latest', checkRole([USER_ROLES.ADMIN]), SchoolController.getLatestSubmissionStatusController);
scheduleVacanciesRouter.post('/submit', checkRole([USER_ROLES.TEACHER]), SchoolController.submitScheduleController);
scheduleVacanciesRouter.put('/review', checkRole([USER_ROLES.ADMIN]), SchoolController.reviewScheduleVacanciesController);
scheduleVacanciesRouter.put('/:submissionId/review', checkRole([USER_ROLES.ADMIN]), SchoolController.reviewScheduleSubmissionController);
scheduleVacanciesRouter.get('/:id', checkRole([USER_ROLES.ADMIN]), SchoolController.getScheduleVacancyByIdController);
scheduleVacanciesRouter.get('/user/:userId', checkRole([USER_ROLES.ADMIN]), SchoolController.getScheduleVacanciesByUserIdController);
scheduleVacanciesRouter.post('/', checkRole([USER_ROLES.ADMIN]), SchoolController.createScheduleVacancyController);
scheduleVacanciesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), SchoolController.updateScheduleVacancyController);
scheduleVacanciesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), SchoolController.deleteScheduleVacancyController);
