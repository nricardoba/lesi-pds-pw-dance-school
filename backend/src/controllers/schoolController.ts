import { NextFunction, Request, Response } from 'express';

// => SCHOOL YEARS
import {
  listSchoolYearsService,
  createSchoolYearService,
  updateSchoolYearService,
  deleteSchoolYearService,
} from '../services/school/schoolYearsServices';

// => SCHEDULE VACANCIES
import {
    getAllScheduleVacanciesService,
    getScheduleVacancyByIdService,
    getScheduleVacanciesByUserIdService,
    createScheduleVacancyService,
    updateScheduleVacancyService,
    deleteScheduleVacancyService,
} from '../services/school/scheduleVacancyServices';

// ============================================================================
// SCHOOL YEARS
// ============================================================================

export const listSchoolYearsController = async (_req: Request, res: Response) => {
    try {
        const data = await listSchoolYearsService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter anos letivos.' });
    }
};

export const createSchoolYearController = async (req: Request, res: Response) => {
    try {
        const data = await createSchoolYearService(req.body);   
        return res.status(201).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao criar ano letivo.' });
    }
};

export const updateSchoolYearController = async (req: Request, res: Response) => {
    try {
        const data = await updateSchoolYearService(req.params, req.body);   
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao atualizar ano letivo.' });
    }
};

export const deleteSchoolYearController = async (req: Request, res: Response) => {
    try {
        await deleteSchoolYearService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao apagar ano letivo.' });
    }
};

// ============================================================================
// SCHEDULE VACANCIES
// ============================================================================

export const listScheduleVacanciesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const vacancies = await getAllScheduleVacanciesService();
        res.status(200).json(vacancies);
    } catch (error) {
        next(error);
    }
};

export const getScheduleVacancyByIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = parseInt(req.params.id, 10);
        const vacancy = await getScheduleVacancyByIdService(id);
        res.status(200).json(vacancy);
    } catch (error) {
        next(error);
    }
};

export const getScheduleVacanciesByUserIdController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const vacancies = await getScheduleVacanciesByUserIdService(userId);
        res.status(200).json(vacancies);
    } catch (error) {
        next(error);
    }
};

export const createScheduleVacancyController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = req.body;
        const defaultUserId = res.locals.user?.id
            ? parseInt(res.locals.user.id, 10)
            : undefined;

        const newVacancy = await createScheduleVacancyService({
            ...data,
            userId: data.userId || defaultUserId,
        });
        res.status(201).json(newVacancy);
    } catch (error) {
        next(error);
    }
};

export const updateScheduleVacancyController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = parseInt(req.params.id, 10);
        const data = req.body;
        const updatedVacancy = await updateScheduleVacancyService(
            id,
            data
        );
        res.status(200).json(updatedVacancy);
    } catch (error) {
        next(error);
    }
};

export const deleteScheduleVacancyController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = parseInt(req.params.id, 10);
        await deleteScheduleVacancyService(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
