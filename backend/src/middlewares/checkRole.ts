import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const checkRole = (allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Verifica e extrai o Token (antigo ensureAuth)
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: { message: 'Token não fornecido.' } });
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: { message: 'Token inválido.' } });
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { userTypeId: number };
      res.locals.user = { id: decoded.sub || '', userTypeId: decoded.userTypeId };
      
      // 2. Verifica a Permissão / Role
      const user = res.locals.user;
      
      if (!allowedRoles.includes(user.userTypeId)) {
        return res.status(403).json({ error: { message: 'Sem permissão para realizar esta ação.' } });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ error: { message: 'Token expirado ou inválido.' } });
    }
  };
};
