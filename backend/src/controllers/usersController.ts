import { Request, Response } from 'express';
import {
  listUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
} from '../services/usersServices';
import { AppError } from '../utils/appError';

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

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao obter utilizador.' });
  }
};

export const createUserController = async (req: Request, res: Response) => {
  try {
    const data = await createUserService(req.body);
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao criar utilizador.' });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const data = await updateUserService(req.params, req.body);
    return res.json(data);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Erro ao atualizar utilizador.' });
  }
};