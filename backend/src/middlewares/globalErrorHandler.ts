import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("Global Error:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { message: err.message } });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        message: "Preencha os campos obrigatórios.",
        details: err.errors,
      },
    });
  }

  // Capturar erros não planeados (500)
  const message =
    process.env.NODE_ENV === 'development' && err?.message
      ? err.message
      : "Ocorreu um erro interno no servidor.";
      
  return res.status(500).json({ error: { message } });
};
