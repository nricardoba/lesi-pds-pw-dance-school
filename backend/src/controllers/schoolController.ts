import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';

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
} from '../services/school';

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
