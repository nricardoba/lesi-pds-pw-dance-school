import { Request, Response } from 'express';
import { AppError } from '../utils/appError';

// => CLASSES
import {
  listClassesService,
  getClassByIdService,
  createClassService,
  addUserToClassService,
  updateClassService,
  deleteClassService,
  updateUserClassService,
  removeUserFromClassService,
} from '../services/classes/classesServices';

// => CLASS STATUSES
import {
    listClassStatusesService,
    createClassStatusService,
    updateClassStatusService,
    deleteClassStatusService,
} from '../services/classes/classStatusesServices';


// ============================================================================
// CLASSES & ENROLLMENTS
// ============================================================================

export const listClassesController = async (_req: Request, res: Response) => {
  try {
    const data = await listClassesService();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao obter aulas.' });
  }
};

export const getClassByIdController = async (req: Request, res: Response) => {
  try {
    const data = await getClassByIdService(req.params);
    return res.json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao obter aula.' });
  }
};

export const createClassController = async (req: Request, res: Response) => {
  try {
    const data = await createClassService(req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao criar aula.' });
  }
};

export const addUserToClassController = async (req: Request, res: Response) => {
  try {
    const data = await addUserToClassService(req.params, req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao associar utilizador à aula.' });
  }
};

export const updateClassController = async (req: Request, res: Response) => {
  try {
    const data = await updateClassService(req.params, req.body);
    return res.json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao atualizar aula.' });
  }
};

export const deleteClassController = async (req: Request, res: Response) => {
  try {
    await deleteClassService(req.params);
    return res.status(204).send();
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro ao apagar aula. A aula pode já estar associada a utilizadores.',
    });
  }
};

export const updateUserClassController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await updateUserClassService(req.params, req.body);
    return res.json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao atualizar inscrição.' });
  }
};

export const removeUserFromClassController = async (
  req: Request,
  res: Response
) => {
  try {
    await removeUserFromClassService(req.params);
    return res.status(204).send();
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao remover utilizador da aula.' });
  }
};

// ============================================================================
// CLASS STATUSES
// ============================================================================

export const listClassStatusesController = async (_req: Request, res: Response) => {
    try {
        const data = await listClassStatusesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter estados da aula.' });
    }
};

export const createClassStatusController = async (req: Request, res: Response) => {
    try {
        const data = await createClassStatusService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao criar estado da aula.' });
    }
};

export const updateClassStatusController = async (req: Request, res: Response) => {
    try {
        const data = await updateClassStatusService(req.params, req.body);
        return res.json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao atualizar estado da aula.' });
    }
};

export const deleteClassStatusController = async (req: Request, res: Response) => {
    try {
        await deleteClassStatusService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao apagar estado da aula.' });
    }
};
