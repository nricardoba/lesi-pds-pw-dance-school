import { Request, Response } from 'express';
import { AppError } from '../utils/appError';

// => STUDIOS
import {
  listStudiosService,
  createStudioService,
  updateStudioService,
  deleteStudioService,
} from '../services/studios/studiosServices';

// => MODALITIES
import {
  listModalitiesService,
  createModalityService,
  updateModalityService,
  deleteModalityService,
} from '../services/studios/modalitiesServices';

// => STUDIO MODALITIES
import {
  listStudioModalitiesService,
  createStudioModalityService,
  updateStudioModalityService,
  deleteStudioModalityService,
} from '../services/studios/studioModalitiesServices';



// ============================================================================
// STUDIOS
// ============================================================================

export const listStudiosController = async (_req: Request, res: Response) => {
    try {
        const data = await listStudiosService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter estúdios.' });
    }
};

export const createStudioController = async (req: Request, res: Response) => {
    try {
        const data = await createStudioService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao criar estúdio.' });
    }
};

export const updateStudioController = async (req: Request, res: Response) => {
    try {
        const data = await updateStudioService(req.params, req.body);
        return res.json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao atualizar estúdio.' });
    }
};

export const deleteStudioController = async (req: Request, res: Response) => {
    try {
        await deleteStudioService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao apagar estúdio.' });
    }
};

// ============================================================================
// MODALITIES
// ============================================================================

export const listModalitiesController = async (_req: Request, res: Response) => {
    try {
        const data = await listModalitiesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter modalidades.' });
    }
};

export const createModalityController = async (req: Request, res: Response) => {
    try {
        const data = await createModalityService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao criar modalidade.' });
    }
};

export const updateModalityController = async (req: Request, res: Response) => {
    try {
        const data = await updateModalityService(req.params, req.body);
        return res.json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao atualizar modalidade.' });
    }
};

export const deleteModalityController = async (req: Request, res: Response) => {
    try {
        await deleteModalityService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao apagar modalidade.' });
    }
};

// ============================================================================
// STUDIO MODALITIES
// ============================================================================

export const listStudioModalitiesController = async (_req: Request, res: Response) => {
    try {
        const data = await listStudioModalitiesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter relações estúdio-modalidade.' });
    }
};

export const createStudioModalityController = async (req: Request, res: Response) => {
    try {
        const data = await createStudioModalityService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao criar relação estúdio-modalidade.' });
    }
};

export const updateStudioModalityController = async (req: Request, res: Response) => {
    try {
        const data = await updateStudioModalityService(req.params, req.body);
        return res.json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao atualizar relação estúdio-modalidade.' });
    }
};

export const deleteStudioModalityController = async (req: Request, res: Response) => {
    try {
        await deleteStudioModalityService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao apagar relação estúdio-modalidade.' });
    }
};

