import { Request, Response } from 'express';
import { AppError } from '../utils/appError';

// => USERS
import {
  listUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
} from '../services/users/usersServices';

// => USER TYPES
import { 
  listUserTypesService 
} from '../services/users/userTypesServices';

// => USER CLASS ROLES
import {
  listUserClassRolesService,
  createUserClassRoleService,
  updateUserClassRoleService,
  deleteUserClassRoleService,
} from '../services/users/userClassRolesServices';


// ============================================================================
// USERS
// ============================================================================

export const listUsersController = async (_req: Request, res: Response) => {
  try {
    const data = await listUsersService();
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao obter utilizadores.' });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const data = await getUserByIdService(req.params);
    return res.json(data);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
    return res.status(500).json({ error: 'Erro ao obter utilizador.' });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const data = await createUserService(req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
    return res.status(500).json({ error: 'Erro ao criar utilizador.' });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const data = await updateUserService(req.params, req.body);
    return res.json(data);
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
    return res.status(500).json({ error: 'Erro ao atualizar utilizador.' });
  }
};

// ============================================================================
// USER TYPES
// ============================================================================

export const listUserTypesController = async (_req: Request, res: Response) => {
    try {
        const data = await listUserTypesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter tipos de utilizadores.' });
    }
};

// ============================================================================
// USER CLASS ROLES
// ============================================================================

export const listUserClassRolesController = async (_req: Request, res: Response) => {
    try {
        const data = await listUserClassRolesService();
        return res.json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Erro ao obter papel de utilizador na aula.' });
    }
};

export const createUserClassRoleController = async (req: Request, res: Response) => {
    try {
        const data = await createUserClassRoleService(req.body);
        return res.status(201).json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao criar papel de utilizador na aula.' });
    }
};

export const updateUserClassRoleController = async (req: Request, res: Response) => {
    try {
        const data = await updateUserClassRoleService(req.params, req.body);
        return res.json(data);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao atualizar papel de utilizador na aula.' });
    }
};

export const deleteUserClassRoleController = async (req: Request, res: Response) => {
    try {
        await deleteUserClassRoleService(req.params);
        return res.status(204).send();
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) return res.status(error.statusCode).json({ error: error.message });
        return res.status(500).json({ error: 'Erro ao apagar papel de utilizador na aula.' });
    }
};
