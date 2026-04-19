import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { loginService, registerService } from '../services/authServices';

export const loginController = catchAsync(async (req: Request, res: Response) => {
  const result = await loginService(req.body);
  return res.status(200).json(result);
});

export const registerController = catchAsync(async (req: Request, res: Response) => {
  const result = await registerService(req.body);
  return res.status(201).json(result);
});
