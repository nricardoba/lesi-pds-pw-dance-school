import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const ensureAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: {
        message: 'Token não fornecido.',
      },
    });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: {
        message: 'Token inválido.',
      },
    });
  }

  try {
    jwt.verify(token, env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      error: {
        message: 'Token expirado ou inválido.',
      },
    });
  }
};
