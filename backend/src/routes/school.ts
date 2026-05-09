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
scheduleVacanciesRouter.get('/all', SchoolController.getAllScheduleSubmissionsController);
scheduleVacanciesRouter.get('/me', SchoolController.getMyScheduleVacanciesController);
scheduleVacanciesRouter.get('/me/submissions', SchoolController.getMyScheduleSubmissionsController);
scheduleVacanciesRouter.get('/me/latest', SchoolController.getMyLatestSubmissionStatusController);
scheduleVacanciesRouter.get('/user/:userId/submissions', SchoolController.getScheduleSubmissionsController);
scheduleVacanciesRouter.get('/user/:userId/latest', SchoolController.getLatestSubmissionStatusController);
scheduleVacanciesRouter.post('/submit', SchoolController.submitScheduleController);
scheduleVacanciesRouter.put('/:submissionId/review', SchoolController.reviewScheduleSubmissionController);
scheduleVacanciesRouter.get('/:id', SchoolController.getScheduleVacancyByIdController);
scheduleVacanciesRouter.get('/user/:userId', SchoolController.getScheduleVacanciesByUserIdController);
scheduleVacanciesRouter.post('/', checkRole([USER_ROLES.ADMIN]), SchoolController.createScheduleVacancyController);
scheduleVacanciesRouter.put('/:id', checkRole([USER_ROLES.ADMIN]), SchoolController.updateScheduleVacancyController);
scheduleVacanciesRouter.delete('/:id', checkRole([USER_ROLES.ADMIN]), SchoolController.deleteScheduleVacancyController);