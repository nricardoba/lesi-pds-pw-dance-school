import { Request, Response } from 'express';
import { loginService, registerService } from '../services/authServices';
import { AppError } from '../utils/appError';

export const loginController = async (req: Request, res: Response) => {
  try {
    const result = await loginService(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: {
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      error: {
        message: 'Erro interno do servidor.',
      },
    });
  }
};

export const registerController = async (req: Request, res: Response) => {
  try {
    const result = await registerService(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: {
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      error: {
        message: 'Erro interno do servidor.',
      },
    });
  }
};