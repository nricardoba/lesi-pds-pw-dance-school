import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const ensureAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('--- ensureAuth ---', req.path);
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log('Token missing');
    return res.status(401).json({ error: { message: 'Token não fornecido.' } });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: { message: 'Token inválido.' } });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { userTypeId: number };
    res.locals.user = { id: decoded.sub || '', userTypeId: decoded.userTypeId };
    console.log('Token verified, assigned res.locals.user', res.locals.user);
    return next();
  } catch (err) {
    console.log('Token verification failed:', err);
    return res.status(401).json({ error: { message: 'Token expirado ou inválido.' } });
  }
};
