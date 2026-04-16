import { Request, Response } from 'express';
import { AppError } from '../utils/appError';
import {
    listUserTypesService,
    listClassStatusesService,
    listUserClassRolesService,
    listModalitiesService,
    listStudiosService,
    listSchoolYearsService,
    listStudioModalitiesService,
    createSchoolYearService,
    createClassStatusService,
    createModalityService,
    createStudioService,
    createStudioModalityService,
    createUserClassRoleService,
    updateSchoolYearService,
    updateClassStatusService,
    updateModalityService,
    updateStudioService,
    updateStudioModalityService,
    updateUserClassRoleService,
    deleteUserClassRoleService,
    deleteSchoolYearService,
    deleteClassStatusService,
    deleteModalityService,
    deleteStudioService,
    deleteStudioModalityService,
} from '../services/referencesServices';

export const listUserTypesController = async (_req: Request, res: Response) => {
    try {
        const data = await listUserTypesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter tipos de utilizador.' });
    }
};

export const listClassStatusesController = async (_req: Request, res: Response) => {
    try {
        const data = await listClassStatusesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter estados da aula.' });
    }
};

export const listUserClassRolesController = async (_req: Request, res: Response) => {
    try {
        const data = await listUserClassRolesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter papéis de aula.' });
    }
};

export const listModalitiesController = async (_req: Request, res: Response) => {
    try {
        const data = await listModalitiesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter modalidades.' });
    }
};

export const listStudiosController = async (_req: Request, res: Response) => {
    try {
        const data = await listStudiosService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter estúdios.' });
    }
};

export const listSchoolYearsController = async (_req: Request, res: Response) => {
    try {
        const data = await listSchoolYearsService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter anos letivos.' });
    }
};

export const listStudioModalitiesController = async (
    _req: Request,
    res: Response
) => {
    try {
        const data = await listStudioModalitiesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter studio-modalities.' });
    }
};

export const createSchoolYearController = async (req: Request, res: Response) => {
    try {
        const created = await createSchoolYearService(req.body);
        return res.status(201).json(created);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao criar ano letivo.' });
    }
};

export const createClassStatusController = async (
    req: Request,
    res: Response
) => {
    try {
        const created = await createClassStatusService(req.body);
        return res.status(201).json(created);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao criar estado da aula.' });
    }
};

export const createModalityController = async (req: Request, res: Response) => {
    try {
        const created = await createModalityService(req.body);
        return res.status(201).json(created);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao criar modalidade.' });
    }
};

export const createStudioController = async (req: Request, res: Response) => {
    try {
        const created = await createStudioService(req.body);
        return res.status(201).json(created);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao criar estúdio.' });
    }
};

export const createStudioModalityController = async (
    req: Request,
    res: Response
) => {
    try {
        const created = await createStudioModalityService(req.body);
        return res.status(201).json(created);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res
            .status(500)
            .json({ error: 'Erro ao associar estúdio e modalidade.' });
    }
};

export const createUserClassRoleController = async (
    req: Request,
    res: Response
) => {
    try {
        const created = await createUserClassRoleService(req.body);
        return res.status(201).json(created);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao criar papel de aula.' });
    }
};

export const updateSchoolYearController = async (req: Request, res: Response) => {
    try {
        const updated = await updateSchoolYearService(req.params, req.body);
        return res.json(updated);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao atualizar ano letivo.' });
    }
};

export const updateClassStatusController = async (
    req: Request,
    res: Response
) => {
    try {
        const updated = await updateClassStatusService(req.params, req.body);
        return res.json(updated);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao atualizar estado da aula.' });
    }
};

export const updateModalityController = async (req: Request, res: Response) => {
    try {
        const updated = await updateModalityService(req.params, req.body);
        return res.json(updated);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao atualizar modalidade.' });
    }
};

export const updateStudioController = async (req: Request, res: Response) => {
    try {
        const updated = await updateStudioService(req.params, req.body);
        return res.json(updated);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao atualizar estúdio.' });
    }
};

export const updateStudioModalityController = async (
    req: Request,
    res: Response
) => {
    try {
        const updated = await updateStudioModalityService(req.params, req.body);
        return res.json(updated);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res
            .status(500)
            .json({ error: 'Erro ao atualizar relação estúdio-modalidade.' });
    }
};

export const updateUserClassRoleController = async (
    req: Request,
    res: Response
) => {
    try {
        const updated = await updateUserClassRoleService(req.params, req.body);
        return res.json(updated);
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao atualizar papel de aula.' });
    }
};

export const deleteUserClassRoleController = async (
    req: Request,
    res: Response
) => {
    try {
        await deleteUserClassRoleService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res
            .status(500)
            .json({ error: 'Erro ao apagar papel de aula. Pode estar em uso.' });
    }
};

export const deleteSchoolYearController = async (req: Request, res: Response) => {
    try {
        await deleteSchoolYearService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res
            .status(500)
            .json({ error: 'Erro ao apagar ano letivo. Pode estar em uso.' });
    }
};

export const deleteClassStatusController = async (
    req: Request,
    res: Response
) => {
    try {
        await deleteClassStatusService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res.status(500).json({ error: 'Erro ao apagar estado. Pode estar em uso.' });
    }
};

export const deleteModalityController = async (req: Request, res: Response) => {
    try {
        await deleteModalityService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res
            .status(500)
            .json({ error: 'Erro ao apagar modalidade. Pode estar em uso.' });
    }
};

export const deleteStudioController = async (req: Request, res: Response) => {
    try {
        await deleteStudioService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res
            .status(500)
            .json({ error: 'Erro ao apagar estúdio. Pode estar em uso.' });
    }
};

export const deleteStudioModalityController = async (
    req: Request,
    res: Response
) => {
    try {
        await deleteStudioModalityService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ error: error.message });
        }

        return res
            .status(500)
            .json({ error: 'Erro ao apagar relação estúdio-modalidade.' });
    }
};
