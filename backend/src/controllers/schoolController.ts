import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

import {
  // => SCHOOL YEARS
  listSchoolYearsService,
  createSchoolYearService,
  updateSchoolYearService,
  deleteSchoolYearService,

  // => SCHEDULE VACANCIES
  getAllScheduleVacanciesService,
  getScheduleVacancyByIdService,
  getScheduleVacanciesByUserIdService,
  createScheduleVacancyService,
  updateScheduleVacancyService,
  deleteScheduleVacancyService,
  getScheduleSubmissionsService,
  getAllScheduleSubmissionsService,
  getLatestSubmissionStatusService,
  submitScheduleService,
  reviewScheduleSubmissionService,
  reviewScheduleVacanciesService
} from '../services/school';

const getAuthenticatedUserId = (res: Response): number => {
  const authUserIdRaw = res.locals.user?.id;
  const authUserId = authUserIdRaw ? parseInt(authUserIdRaw, 10) : NaN;
  if (!authUserId || Number.isNaN(authUserId)) {
    throw new AppError('Utilizador não autenticado.', 401);
  }
  return authUserId;
};

// ============================================================================
// SCHOOL YEARS
// ============================================================================

export const listSchoolYearsController = catchAsync(async (_req: Request, res: Response) => {
  const data = await listSchoolYearsService();
  return res.json(data);
});

export const createSchoolYearController = catchAsync(async (req: Request, res: Response) => {
  const data = await createSchoolYearService(req.body);   
  return res.status(201).json(data);
});

export const updateSchoolYearController = catchAsync(async (req: Request, res: Response) => {
  const data = await updateSchoolYearService(req.params, req.body);   
  return res.json(data);
});

export const deleteSchoolYearController = catchAsync(async (req: Request, res: Response) => {
  await deleteSchoolYearService(req.params);
  return res.status(204).send();
});

// ============================================================================
// SCHEDULE VACANCIES
// ============================================================================

export const listScheduleVacanciesController = catchAsync(async (_req: Request, res: Response) => {
  const vacancies = await getAllScheduleVacanciesService();
  res.status(200).json(vacancies);
});

export const getScheduleVacancyByIdController = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const vacancy = await getScheduleVacancyByIdService(id);
  res.status(200).json(vacancy);
});

export const getScheduleVacanciesByUserIdController = catchAsync(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);
  const vacancies = await getScheduleVacanciesByUserIdService(userId);
  res.status(200).json(vacancies);
});

export const getMyScheduleVacanciesController = catchAsync(async (_req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(res);
  const vacancies = await getScheduleVacanciesByUserIdService(userId);
  res.status(200).json(vacancies);
});

export const createScheduleVacancyController = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const defaultUserId = res.locals.user?.id
    ? parseInt(res.locals.user.id, 10)
    : undefined;

  const newVacancy = await createScheduleVacancyService({
    ...data,
    userId: data.userId || defaultUserId,
  });
  res.status(201).json(newVacancy);
});

export const updateScheduleVacancyController = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const data = req.body;
  const updatedVacancy = await updateScheduleVacancyService(id, data);
  res.status(200).json(updatedVacancy);
});

export const deleteScheduleVacancyController = catchAsync(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  await deleteScheduleVacancyService(id);
  res.status(204).send();
});


export const getScheduleSubmissionsController = catchAsync(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    const submissions = await getScheduleSubmissionsService(userId);
    res.status(200).json(submissions);
});

export const getMyScheduleSubmissionsController = catchAsync(async (_req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(res);
  const submissions = await getScheduleSubmissionsService(userId);
  res.status(200).json(submissions);
});

export const getAllScheduleSubmissionsController = catchAsync(async (req: Request, res: Response) => {
    // Get all schedule vacancies grouped by user
    const submissions = await getAllScheduleSubmissionsService();
    res.status(200).json(submissions);
});

export const getLatestSubmissionStatusController = catchAsync(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    const latestStatus = await getLatestSubmissionStatusService(userId);
    res.status(200).json(latestStatus);
});

export const getMyLatestSubmissionStatusController = catchAsync(async (_req: Request, res: Response) => {
  const userId = getAuthenticatedUserId(res);
  const latestStatus = await getLatestSubmissionStatusService(userId);
  res.status(200).json(latestStatus);
});

export const submitScheduleController = catchAsync(async (req: Request, res: Response) => {
  const { schoolYearId, vacancies } = req.body;
  const authUserId = getAuthenticatedUserId(res);
  const createdVacancies = await submitScheduleService(authUserId, schoolYearId, vacancies);
  res.status(201).json(createdVacancies);
});

export const reviewScheduleSubmissionController = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.body;
    const submissionIdStr = req.params.submissionId;
    const userId = parseInt(submissionIdStr, 10);
    await reviewScheduleSubmissionService(userId, status);
    res.status(200).json({ message: `Submission for user ${userId} reviewed with status: ${status}` });
});

export const reviewScheduleVacanciesController = catchAsync(async (req: Request, res: Response) => {
  const { status, vacancyIds } = req.body;
  await reviewScheduleVacanciesService(vacancyIds, status);
  res.status(200).json({ message: `Vacancies reviewed with status: ${status}` });
});