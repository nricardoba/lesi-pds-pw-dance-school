import { Request, Response } from 'express';
import { AppError } from '../utils/appError';

import {
  listSchoolYearsService,
  createSchoolYearService,
  updateSchoolYearService,
  deleteSchoolYearService,
} from '../services/school/schoolYearsServices';

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
